import Image from "next/image";

export const Icon = (props: { name: string }) => {
  return <Image src={`${props.name}.svg`} alt="Icon" width={24} height={24} />;
};