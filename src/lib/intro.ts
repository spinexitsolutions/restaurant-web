export const INTRO_KEY = "noor-intro-seen";

export function shouldSkipIntroScript(oncePerSession: boolean) {
  return `try{var f=location.search.indexOf('intro=1')>-1;if(${oncePerSession ? "true" : "false"}&&!f&&sessionStorage.getItem('${INTRO_KEY}'))document.documentElement.classList.add('intro-skip')}catch(e){}`;
}
