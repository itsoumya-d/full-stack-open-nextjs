import { test, expect } from "@playwright/test"
import { EvidenceProvenanceGraph } from "../app/lib/evidence-provenance"

test.describe("Evidence Provenance & Verification Engine", () => {
  test("registers sources with SHA-256 content checksums", async () => {
    const graph = new EvidenceProvenanceGraph()
    const source = graph.registerSource(
      "src-sec-10k-2025",
      "regulatory_filing",
      "https://data.sec.gov/filing/10k-2025.pdf",
      "Annual recurring revenue grew 42% year-over-year reaching $184M.",
      0.98,
    )

    expect(source.id).toBe("src-sec-10k-2025")
    expect(source.contentHash).toBe(
      EvidenceProvenanceGraph.hashContent(
        "Annual recurring revenue grew 42% year-over-year reaching $184M.",
      ),
    )
    expect(source.confidenceScore).toBe(0.98)
  })

  test("verifies fully grounded analytical claim against authentic sources", async () => {
    const graph = new EvidenceProvenanceGraph()
    graph.registerSource(
      "src-earnings-q4",
      "earnings_call",
      "https://ir.example.com/transcripts/2025-q4.txt",
      "Operating margins expanded 320bps due to cloud consolidation.",
      0.95,
    )

    const claim = graph.registerClaim(
      "claim-margin-expansion",
      "Operating margin expanded by 320bps in Q4.",
      ["src-earnings-q4"],
      0.9,
    )

    const report = graph.verifyClaim(claim.id)
    expect(report.status).toBe("verified")
    expect(report.groundedSourceCount).toBe(1)
    expect(report.averageConfidence).toBeGreaterThanOrEqual(0.9)
    expect(report.tamperVerified).toBe(true)
  })

  test("flags ungrounded hallucination or unsupported assertion", async () => {
    const graph = new EvidenceProvenanceGraph()
    const ungroundedClaim = graph.registerClaim(
      "claim-unsupported-forecast",
      "EBITDA will exceed $500M without capital injection.",
      [],
    )

    const report = graph.verifyClaim(ungroundedClaim.id)
    expect(report.status).toBe("unsupported")
    expect(report.groundedSourceCount).toBe(0)
    expect(report.tamperVerified).toBe(false)
  })

  test("detects corrupted source payloads and marks status conflicted", async () => {
    const graph = new EvidenceProvenanceGraph()
    const source = graph.registerSource(
      "src-market-audit",
      "market_research",
      "https://benchmarks.internal/cloud-saas.json",
      "Raw benchmark metrics: retention rate 118%.",
      0.94,
    )

    graph.registerClaim(
      "claim-retention",
      "Net revenue retention reached 118%.",
      [source.id],
    )

    // Simulate content tampering after hash generation
    source.rawContent = "Tampered benchmark metrics: retention rate 85%."

    const report = graph.verifyClaim("claim-retention")
    expect(report.status).toBe("conflicted")
    expect(report.tamperVerified).toBe(false)
  })

  test("evaluates partner audit threshold across portfolio analysis", async () => {
    const graph = new EvidenceProvenanceGraph()
    graph.registerSource(
      "src-fin-1",
      "financial_statement",
      "https://audit.firm.internal/sheets/income-2025.csv",
      "Gross profit margin stands at 78.4%.",
      0.96,
    )

    graph.registerClaim("c-1", "Gross margin is 78.4%", ["src-fin-1"])
    graph.registerClaim("c-2", "Unverified competitive moat claim", [])

    const audit = graph.evaluatePartnerStandard(0.9)
    expect(audit.totalClaims).toBe(2)
    expect(audit.verifiedClaims).toBe(1)
    expect(audit.groundednessRate).toBe(0.5)
    expect(audit.auditPassed).toBe(false)
    expect(audit.flaggedClaims).toEqual(["c-2"])
  })
})
