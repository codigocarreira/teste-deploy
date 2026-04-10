import { useState } from "react";

export default function SectionCard({
  title,
  description,
  children,
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="record-section">
      <button
        type="button"
        className="record-section-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="record-section-title-wrap">
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>

        <span className={`record-section-toggle ${isOpen ? "open" : ""}`}>
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && <div className="record-section-body">{children}</div>}
    </section>
  );
}
