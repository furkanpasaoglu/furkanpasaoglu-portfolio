import { Field, Input, Switch, Textarea } from '../../../ui';
import LangTabs from './LangTabs';

export default function CommunicationsTab({ form, onTestSmtp, testing }) {
  const smtpOn = !!form.value('communications.smtp.enabled');
  const replyOn = !!form.value('communications.autoReply.enabled');

  return (
    <>
      <p className="fp-panel-title">SMTP</p>
      <Switch label="SMTP açık" {...form.bindCheck('communications.smtp.enabled')} />
      <p className="fp-hint">Kapalıyken iletişim formu mesajı yine kaydeder, sadece e-posta göndermez.</p>

      <div className="fp-grid">
        <Field label="Sunucu" error={form.error('communications.smtp.host')}>
          <Input mono disabled={!smtpOn} placeholder="smtp.example.com" {...form.bind('communications.smtp.host')} />
        </Field>
        <Field label="Port" error={form.error('communications.smtp.port')}>
          <Input type="number" disabled={!smtpOn} {...form.bind('communications.smtp.port', { number: true })} />
        </Field>
        <Field label="Kullanıcı" error={form.error('communications.smtp.username')}>
          <Input disabled={!smtpOn} autoComplete="off" {...form.bind('communications.smtp.username')} />
        </Field>
        <Field label="Parola" hint="Kayıtlıysa boş bırakırsan değişmez." error={form.error('communications.smtp.password')}>
          <Input type="password" disabled={!smtpOn} autoComplete="new-password" {...form.bind('communications.smtp.password')} />
        </Field>
        <Field label="Gönderen adresi" error={form.error('communications.smtp.fromAddress')}>
          <Input type="email" disabled={!smtpOn} {...form.bind('communications.smtp.fromAddress')} />
        </Field>
        <Field label="Gönderen adı" error={form.error('communications.smtp.fromName')}>
          <Input disabled={!smtpOn} {...form.bind('communications.smtp.fromName')} />
        </Field>
      </div>

      <div className="fp-switches">
        <Switch label="STARTTLS kullan" disabled={!smtpOn} {...form.bindCheck('communications.smtp.useStartTls')} />
      </div>

      <Field label="Bildirim adresi" hint="Yeni mesaj geldiğinde buraya haber verilir.">
        <Input type="email" {...form.bind('communications.adminNotifyEmail')} />
      </Field>

      {onTestSmtp && (
        <div className="fp-btns">
          <button type="button" className="fp-btn" onClick={onTestSmtp} disabled={!smtpOn || testing}>
            {testing ? '…' : 'Test e-postası gönder'}
          </button>
        </div>
      )}

      <hr className="fp-rule" />

      <p className="fp-panel-title">Otomatik yanıt</p>
      <Switch label="Otomatik yanıt açık" {...form.bindCheck('communications.autoReply.enabled')} />
      <p className="fp-hint">Formu dolduran kişiye gönderilen teşekkür e-postası.</p>

      <LangTabs>
        {(lang) => (
          <>
            <Field label="Konu">
              <Input disabled={!replyOn} {...form.bind(`communications.autoReply.subject_${lang}`)} />
            </Field>
            <Field label="Gövde">
              <Textarea rows={6} disabled={!replyOn} {...form.bind(`communications.autoReply.body_${lang}`)} />
            </Field>
          </>
        )}
      </LangTabs>
    </>
  );
}
