export default function StatusBadge({ type, value }) {
  const norm = value?.toString().toLowerCase() || '';
  
  if (type === 'urgency') {
    let bg = 'var(--cb-low-bg)';
    let color = 'var(--cb-low)';
    let text = 'Low';
    
    if (norm === '5') { bg = 'var(--cb-critical-bg)'; color = 'var(--cb-critical)'; text = 'Critical'; }
    else if (norm === '4') { bg = 'var(--cb-high-bg)'; color = 'var(--cb-high)'; text = 'High'; }
    else if (norm === '3') { bg = 'var(--cb-moderate-bg)'; color = 'var(--cb-moderate)'; text = 'Moderate'; }

    return (
      <span className="font-sans uppercase tracking-wide" style={{ background: bg, color: color, fontSize: 'var(--fs-xs)', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>
        {text}
      </span>
    );
  }

  if (type === 'status') {
    let bg = 'var(--cb-border)';
    let color = 'var(--cb-slate)';
    
    if (['open'].includes(norm)) { bg = 'var(--cb-open-bg)'; color = 'var(--cb-open)'; }
    else if (['assigned'].includes(norm)) { bg = 'var(--cb-assigned-bg)'; color = 'var(--cb-assigned)'; }
    else if (['resolved', 'accepted', 'completed'].includes(norm)) { bg = 'var(--cb-resolved-bg)'; color = 'var(--cb-resolved)'; }
    else if (['declined', 'suspended'].includes(norm)) { bg = 'var(--cb-declined-bg)'; color = 'var(--cb-declined)'; }
    else if (['pending'].includes(norm)) { bg = 'var(--cb-pending-bg)'; color = 'var(--cb-pending)'; }

    const text = value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown';

    return (
      <span className="font-sans" style={{ background: bg, color: color, fontSize: 'var(--fs-xs)', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>
        {text}
      </span>
    );
  }
  
  return null;
}
