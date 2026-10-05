"use client";

import{forwardRef,type DragEventHandler,type ReactNode,type TextareaHTMLAttributes}from"react";

export function SasiUserMessage({children,className=""}:{children:ReactNode;className?:string}){
 return <div data-sasi-role="user" data-sasi-user-color="blue" className={`lx-sasi-user-bubble ml-auto max-w-[82%] rounded-[24px] border px-5 py-3.5 text-sm font-medium leading-7 shadow-sm ${className}`}>{children}</div>;
}

export const SasiComposerTextarea=forwardRef<HTMLTextAreaElement,TextareaHTMLAttributes<HTMLTextAreaElement>>(
 function SasiComposerTextarea({className="",...props},ref){
  return <textarea ref={ref} rows={1} {...props}
   className={`lx-sasi-reference-textarea max-h-64 min-h-[72px] w-full resize-none bg-transparent px-3 py-2 text-[15px] font-medium leading-7 outline-none placeholder:font-normal ${className}`}/>;
 }
);

export function SasiComposerSurface({
 dragging,children,onDragEnter,onDragOver,onDragLeave,onDrop,className=""
}:{
 dragging:boolean;
 children:ReactNode;
 onDragEnter?:DragEventHandler<HTMLDivElement>;
 onDragOver?:DragEventHandler<HTMLDivElement>;
 onDragLeave?:DragEventHandler<HTMLDivElement>;
 onDrop?:DragEventHandler<HTMLDivElement>;
 className?:string;
}){
 return <div
  data-sasi-composer-core="v1"
  onDragEnter={onDragEnter}
  onDragOver={onDragOver}
  onDragLeave={onDragLeave}
  onDrop={onDrop}
  className={`lx-sasi-reference-composer rounded-[30px] border bg-[var(--lx-panel)] p-4 transition sm:p-5 ${dragging?"is-dragging":"border-[var(--lx-line)]"} ${className}`}
 >{children}</div>;
}
