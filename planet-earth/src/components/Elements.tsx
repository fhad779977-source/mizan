import { ELEMENTS, type ElementId } from '../data/content';

interface ElementsProps {
  active: boolean;
  current: ElementId;
  onSelect: (id: ElementId) => void;
}

export function Elements({ active, current, onSelect }: ElementsProps) {
  const index = ELEMENTS.findIndex((e) => e.id === current);

  return (
    <section id="elements" className={`section section--xtall elements ${active ? 'is-active' : ''}`} aria-labelledby="elements-title">
      <div className="sticky">
        <div className="panel elements__panel">
          <p className="eyebrow reveal" style={{ ['--d' as string]: '0s' }}>
            <span>03</span> The Elements
          </p>
          <h2 id="elements-title" className="sr-only">
            The Elements
          </h2>

          <div className="element-tabs reveal" role="tablist" aria-label="Elements" style={{ ['--d' as string]: '0.1s' }}>
            {ELEMENTS.map((el, i) => (
              <span key={el.id} className="element-tabs__item">
                {i > 0 && <span className="element-tabs__dash" aria-hidden="true" />}
                <button
                  type="button"
                  role="tab"
                  aria-selected={current === el.id}
                  className={current === el.id ? 'is-active' : undefined}
                  onClick={() => onSelect(el.id)}
                >
                  {el.title}
                </button>
              </span>
            ))}
          </div>

          <div className="element-stage reveal" style={{ ['--d' as string]: '0.2s' }}>
            {ELEMENTS.map((el) => (
              <div
                key={el.id}
                className={`element ${current === el.id ? 'is-current' : ''}`}
                role="tabpanel"
                aria-hidden={current !== el.id}
              >
                <p className="element__index">{el.index}</p>
                <h3 className="element__title">{el.title}</h3>
                <p className="element__lead">{el.lead}</p>
                <p className="body">{el.body}</p>
                <dl className="element__facts">
                  {el.facts.map(([value, label]) => (
                    <div key={label}>
                      <dd>{value}</dd>
                      <dt>{label}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <div className="element-progress reveal" aria-hidden="true" style={{ ['--d' as string]: '0.3s' }}>
            <span style={{ transform: `translateX(${index * 100}%)` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
