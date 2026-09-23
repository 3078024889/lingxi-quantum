"use client";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolShellText} from "@/lib/tool-shell-i18n";
export default function PrivacyBadge({localOnly=true}:{localOnly?:boolean}){const{lang}=useLingxiLang();const t=(zh:string,en:string)=>toolShellText(lang,zh,en);return localOnly?<p className="inline-flex items-center gap-2 rounded-sm border border-lattice/30 bg-lattice/10 px-3 py-1.5 text-xs text-lattice"><span aria-hidden>🔒</span>{t("浏览器本地处理 · 文件不上传服务器","Processed in your browser · files never leave your device")}</p>:<p className="inline-flex items-center gap-2 rounded-sm border border-amber/30 bg-amber/10 px-3 py-1.5 text-xs text-amber"><span aria-hidden>☁️</span>{t("此功能需上传服务器处理，结束后自动删除","This feature uploads to the server; files are deleted after processing")}</p>}
