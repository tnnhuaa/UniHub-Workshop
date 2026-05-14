import { useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMessage("Please enter email and password.");
            return;
        }

        setErrorMessage(null);
        setIsSubmitting(true);
        const result = await login(email.trim(), password);
        setIsSubmitting(false);

        if (!result.ok) {
            setErrorMessage(result.error.message);
            return;
        }

        if (!result.data.token) {
            setErrorMessage("Missing token from server response.");
            return;
        }

        setAuth({ user: result.data.user, token: result.data.token });
        router.replace("/");
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        <View style={styles.card}>
                            <View style={styles.logoWrap}>
                                <Text style={styles.logoText}>UH</Text>
                            </View>
                            <Text style={styles.title}>UniHub</Text>
                            <Text style={styles.subtitle}>Student Check-in System</Text>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputIcon}>
                                    <Text style={styles.inputIconText}>@</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#9ca3af"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <View style={styles.inputIcon}>
                                    <Text style={styles.inputIconText}>*</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}

                            {isSubmitting ? (
                                <ActivityIndicator style={styles.spinner} color="#1d4ed8" />
                            ) : null}

                            <TouchableOpacity
                                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                                onPress={handleLogin}
                                activeOpacity={0.8}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.buttonText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        paddingVertical: 40,
    },
    card: {
        backgroundColor: "#f8fafc",
        borderRadius: 20,
        padding: 28,
        shadowColor: "#0f172a",
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    logoWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#1d4ed8",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: 16,
    },
    logoText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#475569",
        textAlign: "center",
        marginBottom: 24,
    },
    inputGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        shadowColor: "#0f172a",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    inputIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#e0e7ff",
        alignItems: "center",
        justifyContent: "center",
    },
    inputIconText: {
        color: "#1d4ed8",
        fontSize: 12,
        fontWeight: "700",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#0f172a",
    },
    errorText: {
        color: "#b91c1c",
        fontSize: 13,
        marginBottom: 8,
    },
    spinner: {
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#1d4ed8",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#1d4ed8",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
