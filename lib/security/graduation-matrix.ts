export const SECURITY_GRADUATION_MATRIX=Object.freeze({
 publicIndex:["/","/tools","/sasi","/products","/templates","/release"],
 privateIndex:["/account","/checkout","/checkout-usd","/paypal","/sasi/chat","/sasi/operator","/sasi/connections"],
 templatePublication:{requiresUserConsent:true,requiresVisibility:"public",requiresReview:"approved"},
 creations:{defaultPublic:false,requiresAuthentication:true,ownerScoped:true},
 support:{requiresAuthentication:true,ownerScoped:true},
 money:{liveChargeAutoRun:false,liveWithdrawalAutoRun:false},
 productionDatabase:{autoMigration:false}
});
