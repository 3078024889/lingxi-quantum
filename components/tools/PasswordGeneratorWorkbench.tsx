"use client";
import {useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {generatePassword} from "@/lib/tools/shared/password-generator";
const COPY:Record<LingxiLang,readonly string[]>={
 zh:["密码生成器","使用浏览器加密随机数生成密码，不上传或保存。","密码长度","生成密码","复制","已复制","复制失败，请手动选择密码复制。","每次生成独立的随机密码；不会保证每种字符都出现。"],
 en:["Password generator","Uses your browser’s cryptographic randomness. Nothing is uploaded or saved.","Password length","Generate password","Copy","Copied","Copy failed. Select and copy the password manually.","Each password is independently random; individual character types are not guaranteed."],
 ja:["パスワード生成","ブラウザの暗号学的乱数を使用。送信・保存しません。","文字数","生成","コピー","コピー済み","コピーできません。手動でコピーしてください。","各パスワードは独立した乱数です。すべての文字種が含まれる保証はありません。"],
 ko:["비밀번호 생성기","브라우저 암호화 난수를 사용하며 업로드하거나 저장하지 않습니다.","길이","생성","복사","복사됨","복사하지 못했습니다. 직접 선택해 복사하세요.","각 비밀번호는 독립적인 난수이며 모든 문자 종류가 포함되지는 않을 수 있습니다."],
 fr:["Générateur de mots de passe","Aléatoire cryptographique du navigateur. Aucun envoi ni stockage.","Longueur","Générer","Copier","Copié","Échec. Sélectionnez et copiez manuellement.","Chaque mot de passe est indépendant ; tous les types de caractères ne sont pas garantis."],
 de:["Passwortgenerator","Kryptografischer Zufall im Browser. Kein Upload und keine Speicherung.","Länge","Generieren","Kopieren","Kopiert","Kopieren fehlgeschlagen. Bitte manuell kopieren.","Jedes Passwort ist unabhängig zufällig; einzelne Zeichentypen sind nicht garantiert."],
 es:["Generador de contraseñas","Aleatoriedad criptográfica del navegador. No se sube ni guarda nada.","Longitud","Generar","Copiar","Copiado","No se pudo copiar. Selecciona y copia manualmente.","Cada contraseña es independiente; no se garantiza cada tipo de carácter."],
 pt:["Gerador de senhas","Aleatoriedade criptográfica do navegador. Nada é enviado ou salvo.","Comprimento","Gerar","Copiar","Copiado","Falha ao copiar. Selecione e copie manualmente.","Cada senha é independente; não há garantia de todos os tipos de caracteres."],
 ar:["مولد كلمات المرور","يستخدم العشوائية المشفرة في المتصفح. لا يرفع أو يحفظ أي بيانات.","الطول","إنشاء","نسخ","تم النسخ","تعذر النسخ. حدد كلمة المرور وانسخها يدوياً.","كل كلمة مرور عشوائية مستقلة؛ لا يضمن ظهور كل نوع من المحارف."]
};
export default function PasswordGeneratorWorkbench(){
 const {lang}=useLingxiLang(),c=COPY[lang];
 const [length,setLength]=useState(20),[password,setPassword]=useState(""),[message,setMessage]=useState("");
 return <section className="space-y-4" dir={lang==="ar"?"rtl":"ltr"}>
  <h1 className="text-2xl font-bold">{c[0]}</h1><p>{c[1]}</p>
  <label className="flex items-center gap-3">{c[2]}<input aria-label={c[2]} type="number" min={8} max={128} value={length} onChange={e=>setLength(Number(e.target.value))} className="w-24 rounded-lg border bg-transparent p-2"/></label>
  <button type="button" disabled={!Number.isInteger(length)||length<8||length>128} className="rounded-xl bg-blue-700 px-5 py-3 text-white disabled:opacity-40" onClick={()=>{setPassword(generatePassword(length));setMessage("");}}>{c[3]}</button>
  {password&&<><input aria-label={c[0]} type="text" value={password} readOnly autoComplete="off" spellCheck={false} dir="ltr" className="block w-full rounded-xl border bg-transparent p-4 font-mono" onFocus={e=>e.target.select()}/><button type="button" className="rounded-xl border px-4 py-2" onClick={async()=>{try{await navigator.clipboard.writeText(password);setMessage(c[5]);}catch{setMessage(c[6]);}}}>{c[4]}</button></>}
  <p role="status" aria-live="polite">{message}</p><p className="text-sm text-[var(--lx-muted)]">{c[7]}</p>
 </section>;
}
