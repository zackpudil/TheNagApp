import { Avatar, Box, Center, Heading, Input, KeyboardAvoidingView, Pressable, VStack } from "native-base";
import React, { useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";

function ChooseUserType({ type }) {
    return (
        <Center>
            <VStack space={10} alignItems="center">
                <Heading size="2xl">Nagger or Naggie?</Heading>
                <Pressable onPress={() => type('N') }>
                    <Avatar source={require('../../assets/amber.jpg')} size="200" />
                </Pressable>

                <Pressable onPress={() => type('n') }>
                    <Avatar source={require('../../assets/idiots.jpg')} size="200" />
                </Pressable>
            </VStack>
        </Center>
    );
}

function ChooseNaggie({ loading, onChoice }) {
    return (
        <Center>
            <VStack space={5} alignItems="center">
                <Heading size="2xl">Which Bitch?</Heading>
                <Pressable disabled={loading} onPress={() => onChoice('zack')}>
                    <Avatar source={require('../../assets/zack.jpg')} size="150" />
                </Pressable>

                <Pressable disabled={loading} onPress={() => onChoice('mike')}>
                    <Avatar source={require('../../assets/mike.jpg')} size="150" />
                </Pressable>

                <Pressable disabled={loading} onPress={() => onChoice('gabe')}>
                    <Avatar source={require('../../assets/gabe.jpg')} size="150" />
                </Pressable>
            </VStack>
        </Center>
    )
}

function TestNagger({ onPassed }) {
    const [passwordWrong, setPasswordWrong] = useState(false);
    const [password, setPassword] = useState("");

    const testUser = async () => {
        setPasswordWrong(false);

        if (password == 'loveya') {
            await onPassed();
        } else {
            setPasswordWrong(true);
        }
    };

    return (
        <Center>
            <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "position" : "height"}>
                <VStack space={5} alignItems="center">
                    <Heading size="2xl">Prove yourself</Heading>
                    <Avatar source={require('../../assets/amber.jpg')} size="200" />
                    <Input
                        size="200"
                        isInvalid={passwordWrong}
                        value={password}
                        onChangeText={(value) => setPassword(value)}
                        onSubmitEditing={testUser}
                        autoFocus
                        type="password"
                        placeholder="Password"
                        size="2xl"
                        mx={3}
                        w={{base: "75%", md: "25%"}}
                    />
                    {passwordWrong && (
                        <Box
                            style={{
                                transform: [{ rotateZ: "-43deg" }]
                            }}
                            borderRadius={10}
                            pos="relative"
                            top={-225}
                            shadow="1"
                            borderColor="red.800"
                            borderStyle="solid"
                            borderWidth="4"
                            py={4} px={2}
                            
                        >
                            <Heading size="2xl" color="red.800">
                                Wrong BITCH
                            </Heading>
                        </Box>
                    )}
                </VStack>
            </KeyboardAvoidingView>
        </Center>
    )
}

export default function Login({ createAndSetUser }) {
    
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const backAction = () => {
            setUserType(null);
            return true;
        }
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    });

    const setNaggy = async (name) => {
        setLoading(true);
        const newUser = {
            name,
            type: 'Naggie',
            needsApproval: true,
            xp: 0
        };
        await createAndSetUser(newUser);
        setLoading(false);
    };

    const setNagger = async () => {
        const newUser = {
            name: 'amber',
            type: 'Nagger'
        };
        await createAndSetUser(newUser);
    };

    if (userType == null) return <ChooseUserType type={setUserType} />
    if (userType == "n") return <ChooseNaggie loading={loading} onChoice={setNaggy} />

    return <TestNagger onPassed={setNagger} />
}