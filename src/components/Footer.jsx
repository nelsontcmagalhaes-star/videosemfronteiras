const GREEN = '#1d8a6f'

export default function Footer() {
  return (
    <div className="text-center py-4 px-4" style={{ borderTop: '1px solid rgba(42,171,142,0.15)' }}>
      <p className="text-xs font-medium" style={{ color: GREEN }}>
        Desenvolvido por <span className="font-bold">Nelson Tomaz Catunda Magalhães</span>
      </p>
      <p className="text-xs mt-0.5" style={{ color: GREEN }}>
        nelsonassembler@gmail.com
      </p>
      <p className="text-xs mt-0.5" style={{ color: GREEN }}>
        © 2026 Todos os direitos reservados
      </p>
    </div>
  )
}
