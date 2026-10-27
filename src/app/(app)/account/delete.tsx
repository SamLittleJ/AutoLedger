import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { Button } from "@/components/button";
import { FormField } from "@/components/form-field";
import { FormScreen } from "@/components/form-screen";
import {
  fontSize,
  fontWeight,
  lineHeight,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";
import { deleteAccount } from "@/lib/account";
import { getAccountDeletionErrorMessage } from "@/lib/account-errors";
import { useAuth } from "@/lib/auth";

// Asks for the password again, so a mistap or an unlocked phone in someone
// else's hands cannot delete the account.
export default function DeleteAccountScreen() {
  const { session } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const email = session?.user.email;
    if (isDeleting || !email) return;
    if (!password) {
      setErrorMessage("Introdu parola ca să confirmi.");
      return;
    }
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      // On success the session ends and the app shows the sign-in screen.
      await deleteAccount(email, password);
    } catch (error) {
      setErrorMessage(getAccountDeletionErrorMessage(error));
      setIsDeleting(false);
    }
  }

  return (
    <FormScreen>
      <Text style={styles.title}>Ștergi contul?</Text>
      <Text style={styles.text}>
        Se șterg definitiv contul {session?.user.email}, mașina și toate cheltuielile. Acțiunea
        nu poate fi anulată.
      </Text>
      <FormField
        label="Parola"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        editable={!isDeleting}
      />
      {errorMessage && (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      )}
      <Button
        title={isDeleting ? "Se șterge…" : "Șterge contul definitiv"}
        variant="danger"
        onPress={handleDelete}
        isLoading={isDeleting}
      />
    </FormScreen>
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    title: { color: colors.text, fontSize: fontSize.x3l, fontWeight: fontWeight.bold },
    text: { color: colors.text, fontSize: fontSize.md, lineHeight: lineHeight.md },
    error: { color: colors.error, fontSize: fontSize.md, lineHeight: lineHeight.md },
  });
