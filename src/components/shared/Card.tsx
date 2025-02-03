interface CardProps {
  url?: string
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({
  url,
  title,
  description,
  children,
  className = ""
}: CardProps) => {
  const CardWrapper = url ? 'a' : 'div';
  const cardProps = url ? {
    href: url,
    target: "_blank",
    rel: "noopener noreferrer"
  } : {};

  return (
    <CardWrapper
      {...cardProps}
      className={`rounded-xl border border-gray-200 p-6 text-left text-inherit ${url ? 'transition-colors hover:border-blue-600 hover:text-blue-600 focus:border-blue-600 focus:text-blue-600 active:border-blue-600 active:text-blue-600' : ''} ${className}`}
    >
      {title && <h2 className="mb-4 text-2xl">{title} &rarr;</h2>}
      {description && <p className="m-0 text-xl">{description}</p>}
      {children}
    </CardWrapper>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}: CardContentProps) => (
  <div className={`flex flex-col space-y-4 ${className}`}>
    {children}
  </div>
)