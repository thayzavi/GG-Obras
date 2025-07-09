import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Button, Card } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { api } from '../Services/api';

export default function Obra({ navigation }) {
    const [nome, setNome] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [descricao, setDescricao] = useState('');
    const [localizacao, setLocalizacao] = useState(null);
    const [foto, setFoto] = useState(null);
    const [nomeLocal, setNomeLocal] = useState('');

    useEffect(() => {
        (async () => {
            // aviso de premissão para acessar localização atual 
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (locationStatus !== 'granted') {
                Alert.alert('Permissão negada', 'Permissão para localização é necessária!');
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

            // aviso de permissão a camera e galeria 
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
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [],
        {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      setFoto(`data:image/jpeg;base64,${manipResult.base64}`);
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível selecionar a imagem');
  }
};

const tirarFoto = async () => {
   try {
     const result = await ImagePicker.launchCameraAsync({
       allowsEditing: true,
       aspect: [4, 3],
       quality: 1,
     });
 
     if (!result.canceled && result.assets && result.assets[0].uri) {
       const manipResult = await ImageManipulator.manipulateAsync(
         result.assets[0].uri,
         [],
         {
           compress: 1,
           format: ImageManipulator.SaveFormat.JPEG,
           base64: true,
         }
       );
       setFoto(`data:image/jpeg;base64,${manipResult.base64}`);
     }
   } catch (error) {
     Alert.alert('Erro', 'Não foi possível tirar a foto');
   }
 };

    const salvarObra = async () => {//subimit de slvação da obra 
        if (!nome || !responsavel || !dataInicio || !localizacao) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
            return;
        }
        const parseDate = (value) => {//transforma data em um objeto date
        const [dia, mes, ano] = value.split('/');
        return new Date(`${ano}-${mes}-${dia}`);
        };

        try {
            await api.post('/api/obras', {//campos enviados para o back
            nome,
            responsavel,
            dataInicio: parseDate(dataInicio),
            dataFim: dataFim ? parseDate(dataFim) : null,
            descricao,
            localizacao: {
                lat: Number(localizacao.lat),
                lng: Number(localizacao.lng)
            },
            endereco: nomeLocal,
            foto,
            });
            Alert.alert('Sucesso', 'Obra cadastrada!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar Obra');
    }

    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            
            <Text>Nome da obra</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} />
            
            <Text>Responsável</Text>
            <TextInput style={styles.input} value={responsavel} onChangeText={setResponsavel} />
            
           <View style={styles.inputGroup}>
                <View style={styles.inputBox}>
                    <Text>Data Início</Text>
                    <TextInput style={styles.inputG} value={dataInicio} onChangeText={setDataInicio} />
                </View>
                <View style={styles.inputBox}>
                    <Text>Previsão de Término</Text>
                    <TextInput style={styles.inputG} value={dataFim} onChangeText={setDataFim} />
                </View>
            </View>

            <Text>Foto da obra:</Text>
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
                Galeria
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

            <Text>Descrição</Text>
            <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} multiline />
            
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
                        title="Local da obra"
                        description={nomeLocal}
                    />
                </MapView>
            )}
            <Button 
            mode="contained"
            icon="content-save"
            onPress={salvarObra}
            style={styles.btn}
            > Salvar Obra </Button>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
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
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 8
    } ,
    inputG: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginRight: 'auto'
    },
    inputBox:{
        flex:1
    },
    fotoButton: {
        flex: 1,
        marginHorizontal: 5,
        borderColor: '#A34003',
        borderWidth: 1,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    card:{
        marginBottom: 30,
        backgroundColor: 'transparent',
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
    btn:{
        marginBottom: 65,
        backgroundColor: '#008000',
        marginInlineStart: 'auto',
        marginBottom: 20,
    }
});