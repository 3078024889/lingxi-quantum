export const SASI_RELEASE_INVARIANTS={
 changedSourceParseBeforeBuild:true,
 patchTransformerSelfTest:true,
 negativeFixtureBeforeBuild:true,
 cssStructuralPreflight:true,
 idempotentInstaller:true,
 semanticPostPatchVerification:true,
 stableStepIdsAcrossLiveRuns:true,
 externalSideEffectsNeedBusinessIdempotencyKey:true,
 permanentVsTransientErrorsSeparated:true,
 activeRunsProtectedFromBreakingWorkflowShapeChanges:true,
 durableStateStoresReferencesNotLargeArtifacts:true,
 productionMaturityRequiresOnlineAndOfflineEvidence:true,
 previewEnvironmentBeforeProduction:true,
 affectedGraphAwareValidation:true,
 resumeAfterColdRestartTest:true,
 resumePayloadRoundTripTest:true,
 publicEventAllowlist:true,
 workerVersionCompatibilityRequired:true,
 streamReconnectReplayRequired:true,
 stableBusinessStepIds:true,
 explicitBillingConsentRequired:true,
 durableStepMemoizationRequired:true,
 providerExactlyOnceNotAssumed:true,
 capabilityContractOverImplementationString:true,
 delegationChainAudited:true,
 legacyAuditMigrationRequired:true,
 regressionFixtureForEveryFalsePositive:true,
 postgrestBuilderAwaitOnly:true,
 cleanupMustNotMaskOriginalError:true,
 detachedWorkerLeaseRequired:true,
 durableStepFencingRequired:true,
 staleWorkerCompletionRejected:true,
 schemaExpandMigrateContractRequired:true,
 queuePriorityMustAge:true,
 workflowVersionCompatibilityRequired:true,
 workerEndpointFailClosed:true,
 jobPayloadBounded:true,
 canonicalRegionTypeRequired:true,
 simplePrimaryComposerRequired:true,
 technicalRuntimeStateHiddenFromPrimaryUi:true,
 releaseClosureBeforeNextMajorRound:true,
}as const;

export type SasiReleaseEvidence={
 parsePass:boolean;
 buildPass:boolean;
 regressionPass:boolean;
 offlineEvalPass:boolean;
 chaosPass:boolean;
};

export function releaseCandidateAllowed(e:SasiReleaseEvidence){
 return e.parsePass&&e.buildPass&&e.regressionPass;
}
