import { Button, ButtonProps } from "@mantine/core";
import { ComponentPropsWithoutRef } from "react";
import { GoogleIcon } from "../icons/GoogleIcon";


export function GoogleButton(props: ButtonProps & ComponentPropsWithoutRef<'button'>) {
  return <Button leftSection={<GoogleIcon />} variant="default" {...props} />;
}