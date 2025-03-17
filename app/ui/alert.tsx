import { AlertCircle } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface CustomAlertProps {
    variant: "default" | "destructive" | null | undefined;
    title: string;
    description: string;
}

export function CustomAlert({ variant, title, description }: CustomAlertProps) {
    return (
        <Alert variant={variant}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {description}
            </AlertDescription>
        </Alert>
    )
}
