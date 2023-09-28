import { type Writable, writable } from "svelte/store";

export enum NotifierKind {
  ERROR   = "error",
  NORMAL  = "normal",
  SUCCESS = "success",
  WARNING = "warning",
}
export type NotifierMessage = { kind: NotifierKind, text: string };
export let NOTIFIER : Writable<NotifierMessage> = writable({kind: NotifierKind.NORMAL, text: ""});
export const showMessage = (text: string, kind: NotifierKind = NotifierKind.NORMAL) => NOTIFIER.set({kind, text});