import logo from "@/assets/pollit-logo.png";

export const logoBrandClass =
  "h-16 w-auto sm:h-20 md:h-24 max-w-[9rem] sm:max-w-[11rem] md:max-w-[13rem]";

export const logoNavClass = "h-12 w-auto sm:h-14 max-w-[8rem] sm:max-w-[9rem]";

export function LogoBrand({ className = logoBrandClass }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="PollIt"
      draggable={false}
      className={`object-contain object-left select-none ${className}`}
    />
  );
}

export function Logo({ className }: { className?: string }) {
  return <LogoBrand className={className ?? logoNavClass} />;
}

export function LogoMark({ className = "h-10 w-10 sm:h-12 sm:w-12" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-brand opacity-90 blur-[2px]" />
      <div className="absolute inset-[3px] rounded-full bg-background flex items-center justify-center">
        <span className="text-gradient font-bold text-sm">P</span>
      </div>
    </div>
  );
}
