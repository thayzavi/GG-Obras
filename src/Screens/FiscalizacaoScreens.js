import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Button, Card } from 'react-native-paper';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { api } from '../Services/api';

export default function Fiscalizacao({ navigation, route }) {
    const [data, setData] = useState('');
    const [status, setStatus] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [localizacao, setLocalizacao] = useState(null);
    const [nomeLocal, setNomeLocal] = useState('');
    const [foto, setFoto] = useState(null);
    const { obraId } = route.params;

    
    const statusList = [
        { label: 'Pendente', value: 'pendente' },
        { label: 'Em andamento', value: 'em-andamento' },
        { label: 'Concluído', value: 'concluido' },
        { label: 'Atrasado', value: 'atrasado' },
    ];

    useEffect(() => {
        (async () => {
            // Solicitar permissões de localização
            const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            if (locStatus !== 'granted') {
                Alert.alert('Permissão negada', 'Permissão para acessar a localização é necessária!');
            } else {
                const location = await Location.getCurrentPositionAsync({});
                const coords = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                };
                setLocalizacao(coords);

                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: coords.lat,
                    longitude: coords.lng,
                });

                if(reverseGeocode.length > 0) {
                    const { street, name, region, district, postalCode} = reverseGeocode[0];
                    setNomeLocal(`${street || name} - ${district || streetNumber} , ${region} - ${postalCode}`);
                } else {
                    setNomeLocal('Endereço não encontrado');
                }
            }

            // Solicitar permissões de mídia
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para adicionar fotos!');
            }
        })();
    }, []);

    const selecionarFoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0].base64) {
                setFoto('data:image/jpg;base64,' + result.assets[0].base64) ;
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão para acessar a câmera é necessária!');
        return;
    }

    try {
        const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
        });

        if (!result.canceled && result.assets?.[0]?.base64) {
        setFoto('data:image/jpg;base64,' + result.assets[0].base64);
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
};

    const salvarFiscalizacao = async () => {
        if (!data || !status || !localizacao) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
            return;
        }
         const partes = data.split('/');
         const dataFormatada = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);

        try {
            await api.post('/api/fiscalizacoes', {
                data: dataFormatada,
                status,
                observacoes,
                localizacao: {
                lat: Number(localizacao.lat),
                lng: Number(localizacao.lng)
            },
            endereco: nomeLocal,
                foto,
                obra: obraId,
            });
            Alert.alert('Sucesso', 'Fiscalização cadastrada!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar fiscalização');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>


            <Text>Data da Fiscalização</Text>
            <TextInput 
                style={styles.input} 
                value={data} 
                onChangeText={setData}
                placeholder="DD/MM/AAAA"
            />

            <View style={{ zIndex: 1000 }} >
                <Text>Status</Text>
                <RNPickerSelect
                    onValueChange={(value) => setStatus(value)}
                    value={status}
                    placeholder={{ label: 'Selecione um status', value: '' }}
                    items={statusList}
                    style={{
                        inputIOS: styles.picker,
                        inputAndroid: styles.picker
                    }}
                    useNativeAndroidPickerStyle={false}
                />
            </View>
            <Text>Observações</Text>
            <TextInput 
                style={[styles.input, { height: 100 }]} 
                value={observacoes} 
                onChangeText={setObservacoes} 
                multiline 
                placeholder="Descreva as observações da fiscalização"
            />


            <Text>Foto da fiscalização:</Text>
            <View style={styles.buttonGroup}>

            <Button
                mode="outlined"
                icon="camera"
                onPress={tirarFoto}
                style={styles.fotoButton}>
                    Tirar Foto
            </Button>
            
                <Button
                    mode="outlined"
                    icon="image"
                    onPress={selecionarFoto}
                    style={styles.fotoButton}>
                        Selecionar da Galeria
                </Button>
            
        </View>
                {foto ? (
                    <Card style={styles.card}>
                        <Card.Cover source={{ uri: foto }} style={styles.foto} />
                    </Card>
                ) : (
                    <View style={styles.fotoPlaceholder}>
                        <Text style={styles.placeholderText}>Nenhuma foto selecionada</Text>
                    </View>
                )}

             <Text>Localização:</Text>
                <TextInput
                style={styles.input}
                value={nomeLocal}
                onChangeText={setNomeLocal}
                placeholder="Digite o endereço"
                />

            {localizacao && (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: localizacao.lat,
                        longitude: localizacao.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: localizacao.lat,
                            longitude: localizacao.lng,
                        }}
                        title="Local da fiscalização"
                        description={nomeLocal}
                    />
                </MapView>
            )}

            <View>
                <Button 
                    mode="contained"
                    icon="content-save"
                    onPress={salvarFiscalizacao}
                    style={styles.btn}
                    > Salvar Fiscalizaçâo
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#F4F6F6',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    map: {
        height: 200,
        width: '100%',
        marginVertical: 10,
        borderRadius: 10,
    },
    foto: {
        width: '100%',
        height: 250,
        marginTop: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CCC'
    },
    fotoPlaceholder:{
        height: 259,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 20,
    },
    placeholderText: {
        color: '#aaa',
        fontStyle: 'normal',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 8,
    },
    fotoButton: {
        flex: 1,
        marginHorizontal: 5,
        borderColor: '#A34003',
        borderWidth: 1,
    },
    card:{
        marginBottom: 30,
        backgroundColor: 'transparent',
    },
    
    picker: {
        height: 50,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        color: '#000',
        backgroundColor: '#fff',
        marginVertical: 10,
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1000,
    },
    localizacao: {
        marginVertical: 8,
        color: '#555',
    },
    btn:{
      backgroundColor: '#008000',
      marginInlineStart: 'auto',
      marginBottom: 10,
    }
});