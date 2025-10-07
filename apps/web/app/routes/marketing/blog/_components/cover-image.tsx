import { cn } from '@kit/ui/utils';

type Props = {
  title: string;
  src: string;
  className?: string;
};

export function CoverImage({ title, src, className }: Props) {
  return (
    <img
      className={cn('block size-full rounded-md object-cover', {
        className,
      })}
      src={src}
      alt={`Cover Image for ${title}`}
    />
  );
}
