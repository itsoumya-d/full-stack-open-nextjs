import { createHash } from "node:crypto"

export type SourceType =
  | "financial_statement"
  | "regulatory_filing"
  | "market_research"
  | "earnings_call"

export type VerificationStatus =
  | "verified"
  | "unsupported"
  | "conflicted"
  | "insufficient_confidence"

export interface EvidenceSource {
  id: string
  sourceType: SourceType
  uri: string
  rawContent: string
  contentHash: string
  confidenceScore: number
  extractedAt: string
}

export interface AnalyticalClaim {
  id: string
  statement: string
  sourceIds: string[]
  minimumConfidence: number
  status: VerificationStatus
  verifiedAt?: string
}

export interface VerificationReport {
  claimId: string
  statement: string
  status: VerificationStatus
  groundedSourceCount: number
  averageConfidence: number
  tamperVerified: boolean
}

export interface PartnerAuditSummary {
  totalClaims: number
  verifiedClaims: number
  groundednessRate: number
  auditPassed: boolean
  flaggedClaims: string[]
}

export class EvidenceProvenanceGraph {
  private sources: Map<string, EvidenceSource> = new Map()
  private claims: Map<string, AnalyticalClaim> = new Map()
  private claimToSources: Map<string, Set<string>> = new Map()

  public static hashContent(content: string): string {
    return createHash("sha256").update(content.trim()).digest("hex")
  }

  public registerSource(
    id: string,
    sourceType: SourceType,
    uri: string,
    rawContent: string,
    confidenceScore: number,
  ): EvidenceSource {
    const contentHash = EvidenceProvenanceGraph.hashContent(rawContent)
    const source: EvidenceSource = {
      id,
      sourceType,
      uri,
      rawContent,
      contentHash,
      confidenceScore: Math.min(1.0, Math.max(0.0, confidenceScore)),
      extractedAt: new Date().toISOString(),
    }
    this.sources.set(id, source)
    return source
  }

  public registerClaim(
    id: string,
    statement: string,
    sourceIds: string[] = [],
    minimumConfidence: number = 0.85,
  ): AnalyticalClaim {
    const claim: AnalyticalClaim = {
      id,
      statement,
      sourceIds: [...sourceIds],
      minimumConfidence,
      status: "unsupported",
    }
    this.claims.set(id, claim)
    this.claimToSources.set(id, new Set(sourceIds))
    return claim
  }

  public linkEvidence(claimId: string, sourceId: string): void {
    const claim = this.claims.get(claimId)
    const source = this.sources.get(sourceId)
    if (!claim || !source) {
      throw new Error(`Invalid claim or source reference: ${claimId} -> ${sourceId}`)
    }
    if (!claim.sourceIds.includes(sourceId)) {
      claim.sourceIds.push(sourceId)
    }
    this.claimToSources.get(claimId)?.add(sourceId)
  }

  public verifyClaim(claimId: string): VerificationReport {
    const claim = this.claims.get(claimId)
    if (!claim) {
      throw new Error(`Claim not found: ${claimId}`)
    }

    const linkedSourceIds = this.claimToSources.get(claimId) || new Set()
    if (linkedSourceIds.size === 0) {
      claim.status = "unsupported"
      return {
        claimId,
        statement: claim.statement,
        status: "unsupported",
        groundedSourceCount: 0,
        averageConfidence: 0.0,
        tamperVerified: false,
      }
    }

    let totalConfidence = 0
    let tamperOk = true

    for (const sid of linkedSourceIds) {
      const src = this.sources.get(sid)
      if (!src) {
        tamperOk = false
        continue
      }
      const recomputedHash = EvidenceProvenanceGraph.hashContent(src.rawContent)
      if (recomputedHash !== src.contentHash) {
        tamperOk = false
      }
      totalConfidence += src.confidenceScore
    }

    const avgConfidence = totalConfidence / linkedSourceIds.size

    if (!tamperOk) {
      claim.status = "conflicted"
    } else if (avgConfidence < claim.minimumConfidence) {
      claim.status = "insufficient_confidence"
    } else {
      claim.status = "verified"
      claim.verifiedAt = new Date().toISOString()
    }

    return {
      claimId,
      statement: claim.statement,
      status: claim.status,
      groundedSourceCount: linkedSourceIds.size,
      averageConfidence: Number(avgConfidence.toFixed(4)),
      tamperVerified: tamperOk,
    }
  }

  public evaluatePartnerStandard(requiredGroundedness: number = 0.9): PartnerAuditSummary {
    const totalClaims = this.claims.size
    if (totalClaims === 0) {
      return {
        totalClaims: 0,
        verifiedClaims: 0,
        groundednessRate: 1.0,
        auditPassed: true,
        flaggedClaims: [],
      }
    }

    let verifiedCount = 0
    const flaggedClaims: string[] = []

    for (const claimId of this.claims.keys()) {
      const report = this.verifyClaim(claimId)
      if (report.status === "verified") {
        verifiedCount += 1
      } else {
        flaggedClaims.push(claimId)
      }
    }

    const groundednessRate = Number((verifiedCount / totalClaims).toFixed(4))
    const auditPassed = groundednessRate >= requiredGroundedness

    return {
      totalClaims,
      verifiedClaims: verifiedCount,
      groundednessRate,
      auditPassed,
      flaggedClaims,
    }
  }
}
