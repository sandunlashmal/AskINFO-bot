import { useEffect, useRef, useState } from 'react';

// our own drop-down list (the browser's list can not be styled)
// options = [{ value: 1, label: 'Registrar · Birth certificate copy' }, ...]
// emptyLabel = the first line, its value is ''
// keys: ↓ ↑ move, Enter chooses, Esc closes
function SelectBox({ value, onChange, options, emptyLabel, required }) {
  const [open, setOpen] = useState(false);
  // the line the keys (or the mouse) are on
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const listRef = useRef(null);

  const all = [{ value: '', label: emptyLabel }, ...(options ?? [])];
  const chosenIndex = Math.max(0, all.findIndex((option) => String(option.value) === String(value ?? '')));

  // close the list on a click outside it
  useEffect(() => {
    if (!open) return;
    function onClick(event) {
      if (!boxRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // keep the active line in view when the keys move it
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.children[active]?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, active]);

  function openList() {
    setActive(chosenIndex);
    setOpen(true);
  }

  function choose(index) {
    onChange(String(all[index].value));
    setOpen(false);
  }

  function onKeyDown(event) {
    if (!open) {
      // ↓ ↑ Enter or Space opens the list
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(Math.min(active + 1, all.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(Math.max(active - 1, 0));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(active);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      setOpen(false);
    }
  }

  const chosen = all[chosenIndex];

  return (
    <div className="select-box" ref={boxRef}>
      <button
        type="button"
        className={open ? 'select-button open' : 'select-button'}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <OptionText label={chosen.label} empty={chosen.value === ''} />
        <svg className="select-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* a hidden box, so the browser still says "please choose" when it is required */}
      {required && (
        <input className="select-required" tabIndex={-1} value={value ?? ''} onChange={() => {}} required aria-hidden="true" />
      )}

      {open && (
        <ul className="select-list" role="listbox" ref={listRef}>
          {all.map((option, index) => {
            // the empty first line never gets a tick
            const selected = index === chosenIndex && option.value !== '';
            let className = 'select-option';
            if (selected) className += ' selected';
            if (index === active) className += ' active';
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  tabIndex={-1}
                  className={className}
                  onMouseEnter={() => setActive(index)}
                  // mousedown, so the box does not lose focus before the click
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(index)}
                >
                  <OptionText label={option.label} empty={option.value === ''} />
                  {/* a tick next to the chosen line */}
                  {selected && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// "Registrar · Birth certificate copy": the division small, the name bold
function OptionText({ label, empty }) {
  if (empty) {
    return <span className="select-text select-empty">{label}</span>;
  }
  const parts = String(label).split(' · ');
  if (parts.length < 2) {
    return <span className="select-text">{label}</span>;
  }
  return (
    <span className="select-text">
      <small>{parts[0]}</small>
      {parts.slice(1).join(' · ')}
    </span>
  );
}

export default SelectBox;
