import { notifications } from "@mantine/notifications";
import { determineTitle } from "../../utils/successHelpers";
import { StatusIcon } from "../icons/StatusIcon";

function CustomNotification({
  status,
  title,
  message,
}: {
  status: "success" | "error";
  title?: string;
  message: string;
}) {
  notifications.show({
    icon: <StatusIcon status={status} />,
    withBorder: true,
    autoClose: 5000,
    title,
    message: message,
  });
}

export default CustomNotification;
