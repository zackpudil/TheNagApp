import React, { useState, useEffect } from 'react';
import { Avatar, Center, HStack, Pressable, VStack, Text, Box, Button, Icon } from 'native-base';
import { ProgressChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const images = {
    zack: require('../../assets/zack.jpg'),
    mike: require('../../assets/mike.jpg'),
    gabe: require('../../assets/gabe.jpg')
};


export default function NaggerHome({ naggies, nags, currentChanged, openNewNag })  {
    const [data, setData] = useState({ labels: [], data: [], colors: []});

    useEffect(() => {
        const labels = ['nobody', ...naggies.map(naggie => naggie.name)];
        const chartData = labels.map(label => {
            let assignedNags = [];
            if (label === 'nobody') {
                assignedNags = nags.filter(nag => !nag.isAssigned);
            } else {
                assignedNags = nags.filter(nag => nag.assignedToName === label);
            }

            return assignedNags.length / (nags.length || 1);
        });

        setData({
            labels: labels,
            data: chartData,
            colors: ['grey', 'green', 'red', 'black']
        });
    }, [nags, naggies]);

    const chartConfig = {
        backgroundGradientFromOpacity: 0.0,
        backgroundGradientToOpacity: 0.0,
        color: (opacity = 1) => `rgba(56, 189, 248, ${opacity + 0.25})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false // optional
    };

    const screenWidth = Dimensions.get("window").width;

    return (
        <Center>
            <VStack alignItems="center">
                <Pressable onPress={() => currentChanged("users")}>
                    <HStack alignItems="center" space={5}>
                        {naggies.map(naggie => {
                            return (
                                <VStack key={naggie._id} alignItems="center">
                                    <Avatar size="xl" source={images[naggie.name]} />
                                    { naggie.approved && (
                                        <Text>{naggie.xp}</Text>
                                    )}
                                    { naggie.needsApproval && (
                                        <Text>needs approval</Text>
                                    )}
                                </VStack>
                            );
                        })}
                    </HStack>
                </Pressable>
                <Box mr={5}>
                    <Pressable onPress={() => currentChanged("nags")}>
                        <ProgressChart
                            chartConfig={chartConfig}
                            data={data}
                            width={screenWidth}
                            height={300}
                            radius={25}
                            strokeWidth={19}
                            hideLegend={false}
                        />
                    </Pressable>
                </Box>
                <HStack space={5}>
                    <Button
                        bg="emerald.400"
                        onPress={() => openNewNag(null)}
                        leftIcon={<Icon as={<AntDesign name="plus" />} />}
                    >
                        New Nag
                    </Button>
                    <Button
                        bg="lightBlue.400"
                        onPress={() => currentChanged('chores')}
                        leftIcon={<Icon as={<MaterialCommunityIcons name="warehouse" />} />}
                    >
                        Manage Chores
                    </Button>
                </HStack>
                <Box mr={5}>

                </Box>
            </VStack>
        </Center>
    )
}