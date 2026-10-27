import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { FormField } from "@/components/form-field";
import { FormScreen } from "@/components/form-screen";
import { ErrorView, LoadingView } from "@/components/state-views";
import {
  fontSize,
  fontWeight,
  lineHeight,
  space,
  useThemedStyles,
  type AppTheme,
} from "@/components/theme";
import { useAuth } from "@/lib/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getDataErrorMessage } from "@/lib/data-errors";
import { supabase } from "@/lib/supabase";
import { useFocusLoad } from "@/lib/use-focus-load";
import {
  validateVehicleForm,
  type VehicleFormErrors,
  type VehicleFormValues,
} from "@/lib/vehicle-form";
import { fetchVehicle, saveVehicle, type Vehicle } from "@/lib/vehicles";

export default function VehicleScreen() {
  const { state, reload } = useFocusLoad(fetchVehicle);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const styles = useThemedStyles(createStyles);

  if (state.status === "loading") return <LoadingView />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={reload} />;

  const vehicle = state.data;

  return (
    <FormScreen>
      <Text style={styles.title}>{vehicle ? "Mașina ta" : "Adaugă mașina"}</Text>
      {/* Remount when the stored odometer changes (e.g. raised by a new expense),
          so the form never saves a stale reading over it. */}
      <VehicleForm
        key={vehicle ? `${vehicle.id}:${vehicle.current_odometer}` : "new"}
        vehicle={vehicle}
        savedMessage={savedMessage}
        onSaved={() => {
          setSavedMessage(vehicle ? "Modificările au fost salvate." : "Mașina a fost adăugată.");
          reload();
        }}
        onEdit={() => setSavedMessage(null)}
      />
      <SignOutSection />
    </FormScreen>
  );
}

function toFormValues(vehicle: Vehicle | null): VehicleFormValues {
  return {
    make: vehicle?.make ?? "",
    model: vehicle?.model ?? "",
    year: vehicle?.year?.toString() ?? "",
    currentOdometer: vehicle?.current_odometer.toString() ?? "",
  };
}

type VehicleFormProps = {
  vehicle: Vehicle | null;
  savedMessage: string | null;
  onSaved: () => void;
  onEdit: () => void;
};

function VehicleForm({ vehicle, savedMessage, onSaved, onEdit }: VehicleFormProps) {
  const styles = useThemedStyles(createStyles);
  const [values, setValues] = useState(() => toFormValues(vehicle));
  const [errors, setErrors] = useState<VehicleFormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update(field: keyof VehicleFormValues, text: string) {
    setValues((current) => ({ ...current, [field]: text }));
    onEdit();
  }

  async function handleSave() {
    if (isSaving) return;
    setSaveError(null);
    const result = validateVehicleForm(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setIsSaving(true);
    try {
      await saveVehicle(vehicle?.id ?? null, result.data);
      onSaved();
    } catch (error) {
      setSaveError(getDataErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.section}>
      <FormField
        label="Marcă"
        value={values.make}
        onChangeText={(text) => update("make", text)}
        error={errors.make}
        maxLength={50}
        placeholder="ex.: Dacia"
        autoCapitalize="words"
      />
      <FormField
        label="Model"
        value={values.model}
        onChangeText={(text) => update("model", text)}
        error={errors.model}
        maxLength={50}
        placeholder="ex.: Logan"
        autoCapitalize="words"
      />
      <FormField
        label="An (opțional)"
        value={values.year}
        onChangeText={(text) => update("year", text)}
        error={errors.year}
        keyboardType="number-pad"
        maxLength={4}
      />
      <FormField
        label="Kilometraj curent"
        value={values.currentOdometer}
        onChangeText={(text) => update("currentOdometer", text)}
        error={errors.currentOdometer}
        hint="Crește automat când adaugi o cheltuială cu un kilometraj mai mare."
        keyboardType="number-pad"
      />
      {saveError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {saveError}
        </Text>
      )}
      {savedMessage && <Text style={styles.success}>{savedMessage}</Text>}
      <Button
        title={isSaving ? "Se salvează…" : "Salvează"}
        onPress={handleSave}
        isLoading={isSaving}
      />
    </View>
  );
}

function SignOutSection() {
  const styles = useThemedStyles(createStyles);
  const { session } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
      setIsSigningOut(false);
    }
  }

  return (
    <View style={[styles.section, styles.account]}>
      <Text style={styles.muted}>Conectat ca {session?.user.email}</Text>
      {errorMessage && (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorMessage}
        </Text>
      )}
      <Button
        title={isSigningOut ? "Se deconectează…" : "Deconectare"}
        variant="secondary"
        onPress={handleSignOut}
        isLoading={isSigningOut}
      />
      <Button
        title="Șterge contul"
        variant="danger"
        onPress={() => router.push("/account/delete")}
        disabled={isSigningOut}
      />
    </View>
  );
}

const createStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    title: { color: colors.text, fontSize: fontSize.x3l, fontWeight: fontWeight.bold },
    section: { gap: space.lg },
    account: {
      marginTop: space.lg,
      paddingTop: space.x2l,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    muted: { color: colors.muted, fontSize: fontSize.md },
    error: { color: colors.error, fontSize: fontSize.md, lineHeight: lineHeight.md },
    success: { color: colors.success, fontSize: fontSize.md, lineHeight: lineHeight.md },
  });
