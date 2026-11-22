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
      try{await webpush.sendNotification(t,dati,{TTL:86400,urgency:'high'});ok++;}
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
/* Copia cifrata: i dati comuni, in un file illeggibile senza la chiave. Solo conteggi nel registro. */
async function copia({api,segreto,cartella,fetchFn=fetch,log=console.log}){
  const fs=require('fs'),path=require('path'),crypto=require('crypto');
  const f=path.join(cartella,'portale.json');
  let verNota='';try{verNota=JSON.parse(fs.readFileSync(f,'utf8')).ver||'';}catch(e){}
  const c=await chiama(api,'COPIA_leggi',[segreto,verNota],fetchFn);
  if(c.uguale){log('copia: nessuna novità');return false;}
  const b64=b=>b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const chiave=Buffer.from(c.chiave.replace(/-/g,'+').replace(/_/g,'/'),'base64'),iv=crypto.randomBytes(12);
  const ci=crypto.createCipheriv('aes-256-gcm',chiave,iv);
  const ct=Buffer.concat([ci.update(JSON.stringify(c.dati),'utf8'),ci.final(),ci.getAuthTag()]);
  fs.mkdirSync(cartella,{recursive:true});
  fs.writeFileSync(f,JSON.stringify({ver:c.ver,iv:b64(iv),ct:b64(ct)}));
  log('copia: aggiornata');
  return true;
}
module.exports={esegui,copia};
if(require.main===module){
  const {API_URL,NOT_SEGRETO,VAPID_PUBLIC,VAPID_PRIVATE,VAPID_EMAIL}=process.env;
  if(!API_URL||!NOT_SEGRETO||!VAPID_PUBLIC||!VAPID_PRIVATE){console.log('Le impostazioni segrete non ci sono ancora: per ora non faccio nulla');process.exit(0);}
  const webpush=require('web-push');
  webpush.setVapidDetails(VAPID_EMAIL||'mailto:info@corolacordata.org',VAPID_PUBLIC,VAPID_PRIVATE);
  esegui({api:API_URL,segreto:NOT_SEGRETO,webpush}).catch(e=>{console.error(e.message);process.exitCode=1;})
    .then(()=>copia({api:API_URL,segreto:NOT_SEGRETO,cartella:'dati'})).catch(e=>{console.error(e.message);process.exitCode=1;});
}
