export const isFormattableString = ( args:any[] ) => {
  if(!args.length) return false;
  if(typeof args[0] !== 'string') return false;
  if( args[0].includes('%s') || args[0].includes('%d') || args[0].includes('%i') || args[0].includes('%f') || args[0].includes('%j') || args[0].includes('%o') || args[0].includes('%O') ) {
      return true;
  }
  return false;
}

//pad string to specified length. used to keep messages aligned nicely
export const pad = (str:string,len:number) => str + new Array(len - str.length).fill(' ').join('');

export const dateFormatter = (d:Date)=> d.toLocaleString('en-US');