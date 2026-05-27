/**
 * Lightweight entrance wrapper. Uses a CSS animation (not a JS-driven one) so
 * the content's *resting* state is fully visible — the animation only adds a
 * gentle fade-up on top. If anything ever interrupts the animation, the content
 * is still there. Honors prefers-reduced-motion via the CSS (see index.css).
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', sectionRef }) {
  return (
    <Tag ref={sectionRef} className={`reveal ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  )
}
