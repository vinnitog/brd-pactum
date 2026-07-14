import { Field, Select } from './ui/index.jsx'
import { CONTRACT_GROUPS, findTipo } from '../lib/contractTypes.js'

// Seletor de classificação: grupo → tipo → subtipo (quando houver).
// `value` = { groupId, tipo, subtipo }; `onChange` recebe o objeto atualizado.
export default function ClassificationPicker({ value, onChange }) {
  const group = CONTRACT_GROUPS.find((g) => g.id === value.groupId)
  const tipo = value.groupId && value.tipo ? findTipo(value.groupId, value.tipo) : null
  const subtipos = tipo?.subtipos || []

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Field label="Classificação">
        <Select
          value={value.groupId}
          onChange={(e) => onChange({ groupId: e.target.value, tipo: '', subtipo: '' })}
        >
          <option value="">Selecione…</option>
          {CONTRACT_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Tipo">
        <Select
          value={value.tipo}
          disabled={!group}
          onChange={(e) => onChange({ ...value, tipo: e.target.value, subtipo: '' })}
        >
          <option value="">Selecione…</option>
          {group?.tipos.map((t) => (
            <option key={t.nome} value={t.nome}>
              {t.nome}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Subtipo">
        <Select
          value={value.subtipo}
          disabled={subtipos.length === 0}
          onChange={(e) => onChange({ ...value, subtipo: e.target.value })}
        >
          <option value="">{subtipos.length === 0 ? '— não se aplica —' : 'Selecione…'}</option>
          {subtipos.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  )
}
