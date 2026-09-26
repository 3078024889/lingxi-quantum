import { NextResponse } from "next/server";
import { nativeComputeReadiness, configuredNativeModels } from "@/lib/sasi-kernel/compute/native-client";
import { nativeModelCatalogPublic } from "@/lib/sasi-kernel/models/catalog";
import { sasiArtifactR2Ready } from "@/lib/sasi-kernel/artifact-store/r2";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(){
  try{
    const health=await nativeComputeReadiness();
    return NextResponse.json({
      ok:true,
      compute:health,
      models:configuredNativeModels(),
      approvedModels:nativeModelCatalogPublic(),
      artifactStorageReady:sasiArtifactR2Ready(),
    },{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    return NextResponse.json({
      ok:false,
      state:"not-ready",
      reason:error instanceof Error?error.message:"SASI_NATIVE_COMPUTE_UNAVAILABLE",
      approvedModels:nativeModelCatalogPublic(),
      artifactStorageReady:sasiArtifactR2Ready(),
    },{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
