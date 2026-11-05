/* Gira su GitHub ogni mezz'ora: chiede all'app cosa mandare, lo manda, dice com'è andata.
   Il registro di GitHub è pubblico: qui si scrivono solo i conteggi, mai indirizzi o testi. */
async function chiama(api,fn,args,fetchFn){
  const r=await fetchFn(api,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({api:1,fn,args}),redirect:'follow'});
  const j=await r.json();
  if(j.err)throw new Error('Il server ha rifiutato la richiesta');
  if(j.r&&j.r.error)throw new Error('Il server ha rifiutato la richiesta');
  return j.r;
}
async function esegui({api,segreto,webpush,fetchFn=fetch,log=console.log}){
  const c=await chiama(api,'NOT_coda',[segreto],fetchFn);
  const fatti=[],morti=new Set();let ok=0,ko=0;
  for(const m of c.messaggi||[]){
    const dati=JSON.stringify({chiave:m.chiave,titolo:m.titolo,testo:m.testo,url:m.url});
    let problemi=0;
    for(const t of m.a||[]){
      try{await webpush.sendNotification(t,dati,{TTL:86400});ok++;}
      catch(e){
        if(e.statusCode===404||e.statusCode===410)morti.add(t.endpoint);   /* telefono che non c'è più */
        else{ko++;problemi++;}
      }
    }
    if(!problemi)fatti.push(m.chiave);   /* se qualcosa è andato storto si riprova al giro dopo */
  }
  if(fatti.length||morti.size)await chiama(api,'NOT_esito',[segreto,{fatti,morti:[...morti]}],fetchFn);
  log(`messaggi: ${(c.messaggi||[]).length} · consegnati: ${ok} · non riusciti: ${ko} · telefoni tolti: ${morti.size}`);
  return {ok,ko,fatti,morti:[...morti]};
}
module.exports={esegui};
if(require.main===module){
  const {API_URL,NOT_SEGRETO,VAPID_PUBLIC,VAPID_PRIVATE,VAPID_EMAIL}=process.env;
  if(!API_URL||!NOT_SEGRETO||!VAPID_PUBLIC||!VAPID_PRIVATE){console.error('Mancano le impostazioni segrete del repository');process.exit(1);}
  const webpush=require('web-push');
  webpush.setVapidDetails(VAPID_EMAIL||'mailto:info@corolacordata.org',VAPID_PUBLIC,VAPID_PRIVATE);
  esegui({api:API_URL,segreto:NOT_SEGRETO,webpush}).catch(e=>{console.error(e.message);process.exit(1);});
}
