import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EvidenceProvenanceGraph } from "../app/lib/evidence-provenance.ts";

describe("Evidence Provenance & Verification Engine Unit Tests", () => {
  test("registers sources with SHA-256 content checksums", () => {
    const graph = new EvidenceProvenanceGraph();
    const source = graph.registerSource(
      "src-sec-10k-2025",
      "regulatory_filing",
      "https://data.sec.gov/filing/10k-2025.pdf",
      "Annual recurring revenue grew 42% year-over-year reaching $184M.",
      0.98,
    );

    assert.equal(source.id, "src-sec-10k-2025");
    assert.equal(
      source.contentHash,
      EvidenceProvenanceGraph.hashContent(
        "Annual recurring revenue grew 42% year-over-year reaching $184M.",
      ),
    );
    assert.equal(source.confidenceScore, 0.98);
  });

  test("verifies fully grounded analytical claim against authentic sources", () => {
    const graph = new EvidenceProvenanceGraph();
    graph.registerSource(
      "src-earnings-q4",
      "earnings_call",
      "https://ir.example.com/transcripts/2025-q4.txt",
      "Operating margins expanded 320bps due to cloud consolidation.",
      0.95,
    );

    const claim = graph.registerClaim(
      "claim-margin-expansion",
      "Operating margin expanded by 320bps in Q4.",
      ["src-earnings-q4"],
      0.9,
    );

    const report = graph.verifyClaim(claim.id);
    assert.equal(report.status, "verified");
    assert.equal(report.groundedSourceCount, 1);
    assert.ok(report.averageConfidence >= 0.9);
    assert.equal(report.tamperVerified, true);
  });

  test("flags ungrounded hallucination or unsupported assertion", () => {
    const graph = new EvidenceProvenanceGraph();
    const ungroundedClaim = graph.registerClaim(
      "claim-unsupported-forecast",
      "EBITDA will exceed $500M without capital injection.",
      [],
    );

    const report = graph.verifyClaim(ungroundedClaim.id);
    assert.equal(report.status, "unsupported");
    assert.equal(report.groundedSourceCount, 0);
    assert.equal(report.tamperVerified, false);
  });

  test("detects corrupted source payloads and marks status conflicted", () => {
    const graph = new EvidenceProvenanceGraph();
    const source = graph.registerSource(
      "src-market-audit",
      "market_research",
      "https://benchmarks.internal/cloud-saas.json",
      "Raw benchmark metrics: retention rate 118%.",
      0.94,
    );

    graph.registerClaim(
      "claim-retention",
      "Net revenue retention reached 118%.",
      [source.id],
    );

    // Simulate content tampering after hash generation
    source.rawContent = "Tampered benchmark metrics: retention rate 85%.";

    const report = graph.verifyClaim("claim-retention");
    assert.equal(report.status, "conflicted");
    assert.equal(report.tamperVerified, false);
  });

  test("evaluates partner audit threshold across portfolio analysis", () => {
    const graph = new EvidenceProvenanceGraph();
    graph.registerSource(
      "src-fin-1",
      "financial_statement",
      "https://audit.firm.internal/sheets/income-2025.csv",
      "Gross profit margin stands at 78.4%.",
      0.96,
    );

    graph.registerClaim("c-1", "Gross margin is 78.4%", ["src-fin-1"]);
    graph.registerClaim("c-2", "Unverified competitive moat claim", []);

    const audit = graph.evaluatePartnerStandard(0.9);
    assert.equal(audit.totalClaims, 2);
    assert.equal(audit.verifiedClaims, 1);
    assert.equal(audit.groundednessRate, 0.5);
    assert.equal(audit.auditPassed, false);
    assert.deepEqual(audit.flaggedClaims, ["c-2"]);
  });
});
