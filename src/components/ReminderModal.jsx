import Modal from './Modal.jsx'
import ReminderComposer from './ReminderComposer.jsx'

// Transforma um aviso da agenda em texto editável e permite enviar ao cliente
// por WhatsApp / copiar, registrando o histórico (Issue #12).
export default function ReminderModal({ event, party, contract, onClose }) {
  return (
    <Modal title="Lembrete ao cliente" onClose={onClose} maxWidth="max-w-2xl">
      <ReminderComposer event={event} party={party} contract={contract} />
    </Modal>
  )
}
