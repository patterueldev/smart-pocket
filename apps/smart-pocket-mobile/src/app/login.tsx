import { AuthContext } from '@/utils/authContext';
import { useContext } from 'react';
import { View, Text } from 'react-native';

export default function LoginScreen() {
    const authContext = useContext(AuthContext);
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Login Screen</Text>
            <Text onPress={authContext.login} style={{ marginTop: 20, color: 'blue' }}>
                Tap to Login
            </Text>
        </View>
    );
}
