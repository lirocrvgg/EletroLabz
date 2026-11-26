(() => {
  let pending;
  async function api(action,data) {
    const options = data ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)} : {};
    let response, result;
    try {
      response = await fetch('/api/'+action,options);
      result = await response.json();
    } catch {
      throw new Error('Não foi possível conectar ao serviço de contas. Confira a conexão e tente novamente.');
    }
    if (action==='session' && response.status===401) return null;
    if (!response.ok) throw new Error(result.error || 'Não foi possível acessar a conta.');
    return result;
  }
  function form() {
    return new Promise(resolve => {
      const dialog=document.createElement('dialog');
      dialog.className='license-dialog';
      dialog.innerHTML='<form><h2>Conta EletroLabz</h2><p>O nome e o CPF completos aparecerão nas páginas exportadas. O cadastro confere os dígitos do CPF. A titularidade é declarada pelo usuário.</p><label>CPF<input name="cpf" inputmode="numeric" maxlength="14" required></label><label>Senha<input name="password" type="password" autocomplete="current-password" minlength="8" maxlength="128" required></label><label hidden>Nome completo<input name="name" autocomplete="name" maxlength="100"></label><p role="alert"></p><button type="submit">Entrar</button> <button type="button" data-switch>Criar conta</button> <button type="button" data-close>Cancelar</button></form>';
      const f=dialog.querySelector('form'), name=f.elements.namedItem('name'), password=f.elements.password;
      let register=false, user=null;
      const submit=f.querySelector('[type=submit]'), toggle=f.querySelector('[data-switch]');
      toggle.onclick=()=>{
        register=!register;
        name.parentElement.hidden=!register; name.required=register;
        password.autocomplete=register?'new-password':'current-password';
        submit.textContent=register?'Cadastrar e entrar':'Entrar';
        toggle.textContent=register?'Já tenho conta':'Criar conta';
      };
      f.onsubmit=async e=>{
        e.preventDefault();submit.disabled=true;
        try {user=await api(register?'register':'login',Object.fromEntries(new FormData(f)));dialog.close();}
        catch(error){f.querySelector('[role=alert]').textContent=error.message;}
        finally{submit.disabled=false;}
      };
      f.querySelector('[data-close]').onclick=()=>dialog.close();
      dialog.onclose=()=>{dialog.remove();resolve(user);};
      document.body.append(dialog);dialog.showModal();
    });
  }
  async function requireUser(){
    if(!pending) pending=(async()=>{try{return await api('session') || await form();}catch(error){alert(error.message);return null;}})().finally(()=>pending=null);
    return pending;
  }
  function label(user){
    return 'Licenciado para '+user.name+' '+user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/,'$1.$2.$3-$4');
  }
  function image(user){
    const c=document.createElement('canvas');c.width=850;c.height=1100;
    const ctx=c.getContext('2d');ctx.fillStyle='rgba(131,52,52,.17)';ctx.textAlign='center';ctx.font='bold 23px Arial';
    for(const x of [85,425,765])for(const y of [275,825]){
      ctx.save();ctx.translate(x,y);ctx.rotate(-Math.PI/2);ctx.fillText(label(user),0,0,490);ctx.restore();
    }
    return c;
  }
  function pdf(doc,user){
    const png=image(user).toDataURL();
    for(let page=1;page<=doc.getNumberOfPages();page++){
      doc.setPage(page);doc.addImage(png,'PNG',0,0,doc.internal.pageSize.getWidth(),doc.internal.pageSize.getHeight(),'license');
    }
  }
  function header(user){
    const png=Uint8Array.from(atob(image(user).toDataURL().split(',')[1]),c=>c.charCodeAt(0));
    const d=window.docx;
    const mark=new d.ImageRun({data:png,transformation:{width:816,height:1056},floating:{
      horizontalPosition:{relative:'page',offset:0},verticalPosition:{relative:'page',offset:0},behindDocument:true,allowOverlap:true
    }});
    return new d.Header({children:[new d.Paragraph({children:[mark]})]});
  }
  async function printPage(){
    const user=await requireUser();if(!user)return;
    const mark=document.createElement('img');mark.className='license-print';mark.alt='';mark.src=image(user).toDataURL();
    document.body.append(mark);await mark.decode();
    window.addEventListener('afterprint',()=>mark.remove(),{once:true});window.print();
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const manage=document.querySelector('[data-license-account]');
    if(!manage)return;
    async function refresh(){
      try{const user=await api('session');document.getElementById('license-feedback').textContent='';manage.textContent=user?'Sair da conta':'Entrar ou criar conta';manage.onclick=async()=>{try{if(user)await api('logout',{});else await requireUser();await refresh();}catch(error){alert(error.message);}};}
      catch(error){const feedback=document.getElementById('license-feedback'); feedback.textContent=error.message; manage.textContent='Tentar conectar novamente'; manage.onclick=refresh;}
    }
    refresh();
  });
  window.EOLicense={requireUser,pdf,header,printPage};
})();
