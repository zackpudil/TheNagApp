import React, { useEffect, useState } from "react";
import { Center, Heading, Spinner, VStack } from "native-base";
import Login from "./Login";
import { createUser, getUserFromDeviceToken } from "../../utils/user";
import NaggieDashboard from "../naggie/NaggieDashboard";
import NaggerDashboard from "../nagger/NaggerDashboard";

function Splash() {
    return (
        <Center>
            <VStack space={5} alignItems="center">
                <Heading size="3xl">The Nag App</Heading>
                <Spinner size="lg" />
            </VStack>
        </Center>
    );
}

export default function Entry() {
    const [gettingUser, setGettingUser] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const user = await getUserFromDeviceToken();
            setGettingUser(false);
            setUser(user);
        }

        fetchUsers();
    }, []);

    const createAndSetUser = async (newUser) => {
        const postedUser = await createUser(newUser);
        setUser(postedUser);
    }

    if (gettingUser) return <Splash />

    if (user && user.type) {
        if (user.type == 'Naggie') {
            return <NaggieDashboard user={user} />
        } else if (user.type == 'Nagger') {
            return <NaggerDashboard user={user} />
        }
    }

    return (
        <Login createAndSetUser={createAndSetUser} />
    )
}