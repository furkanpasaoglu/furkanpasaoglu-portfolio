/**
 * The fault sheet. Stands in for a 404 (unknown sheet) and for a render
 * failure caught by the boundary. The joke is in the exception; the recovery
 * path underneath it is real and always works.
 */
export default function FaultSheet({ lang, what, onGo }) {
  const tr = lang === 'tr';

  return (
    <div className="bp-fault-wrap">
      <div className="bp-eyebrow">{tr ? 'İşlenmemiş istisna' : 'Unhandled exception'}</div>

      <h2 className="bp-fault-kind">System.NullReferenceException</h2>

      <p className="bp-fault-msg">
        Object reference not set to an instance of an object.
        {' '}
        {tr
          ? 'Ama merak etme, portfolyonun geri kalanı gayet iyi.'
          : "But don't worry, my portfolio is fine."}
      </p>

      <pre className="bp-stack">
{`   at Portfolio.Web.SheetResolver.Resolve(String key)`}
<span className="bp-stack-hi">{`
      key was ${what ? `"${what}"` : 'null'}`}</span>
{`
   at Portfolio.Web.Router.Navigate(NavigationContext ctx)
   at Portfolio.Web.BlueprintApp.Render()
   at System.Runtime.CompilerServices.AsyncMethodBuilderCore.Start[TStateMachine]()`}
      </pre>

      <p className="bp-p">
        {tr
          ? 'Aradığın pafta yok. Aşağıdan kapağa dönebilir ya da terminale `ls` yazıp listeyi görebilirsin.'
          : 'That sheet does not exist. Go back to the cover below, or type `ls` in the terminal to see the list.'}
      </p>

      <button type="button" className="bp-btn" onClick={() => onGo('index')}>
        {tr ? 'Kapağa dön' : 'Back to cover'}
      </button>
    </div>
  );
}
