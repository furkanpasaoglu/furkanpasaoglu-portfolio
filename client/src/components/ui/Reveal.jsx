import useInView from '../../hooks/useInView';
import './Reveal.css';

export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  y = 32,
  className = '',
  ...rest
}) {
  const [ref, inView] = useInView();
  const style = {
    '--reveal-delay': `${delay}ms`,
    '--reveal-y': `${y}px`,
  };
  return (
    <Tag
      ref={ref}
      style={style}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
