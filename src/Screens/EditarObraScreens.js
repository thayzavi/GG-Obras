import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Button, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { api } from '../Services/api';

export default function EditarObra({ navigation, route }) {
  const { obraId } = route.params;

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
      // Permissão para localização
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão para localização é necessária!');
      }

      // Permissão para mídia
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para adicionar fotos!');
      }

      // Buscar dados da obra para edição
      try {
        const response = await api.get(`/api/obras/${obraId}`);
        const obra = response.data;

        setNome(obra.nome);
        setResponsavel(obra.responsavel);

        // Formatar data para DD/MM/AAAA
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        };

        setDataInicio(formatDate(obra.dataInicio));
        setDataFim(formatDate(obra.dataFim));
        setDescricao(obra.descricao || '');
        setLocalizacao(obra.localizacao);
        setNomeLocal(obra.endereco || '');
        setFoto(obra.foto || null);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar obra para edição');
      }
    })();
  }, [obraId]);

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
         [{ resize: { width: 800 } }],
         {
           compress: 0.6,
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
 

  const salvarObra = async () => {
    if (!nome || !responsavel || !dataInicio || !localizacao) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const parseDate = (value) => {
      const [dia, mes, ano] = value.split('/');
      return new Date(`${ano}-${mes}-${dia}`);
    };

    try {
      await api.put(`/api/obras/${obraId}`, {
        nome,
        responsavel,
        dataInicio: parseDate(dataInicio),
        dataFim: dataFim ? parseDate(dataFim) : null,
        descricao,
        localizacao,
        endereco: nomeLocal,
        foto,
      });
      Alert.alert('Sucesso', 'Obra atualizada!');
      navigation.goBack();
    } catch (error) {console.error(error);
    Alert.alert('Erro', 'Falha ao salvar atualização');

    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text>Nome da obra</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text>Responsável</Text>
      <TextInput style={styles.input} value={responsavel} onChangeText={setResponsavel} />

      <Text>Data Início</Text>
      <TextInput style={styles.input} value={dataInicio} onChangeText={setDataInicio} placeholder="DD/MM/AAAA" />

      <Text>Previsão de Término</Text>
      <TextInput style={styles.input} value={dataFim} onChangeText={setDataFim} placeholder="DD/MM/AAAA" />

      <Text>Foto da obra:</Text>
      <View style={styles.buttonGroup}>
          <Button
              mode="contained"
              icon="camera"
              onPress={tirarFoto}
              style={styles.fotoButton}>
              Tirar Foto
          </Button>
        
        <Button
            mode="contained"
            icon="image"
            onPress={selecionarFoto}
            style={styles.fotoButton}>
              Galeria
        </Button>
      </View>

          {foto && (
          <Card style={styles.card}>
            <Card.Cover source={{ uri: foto }} style={styles.foto} />
          </Card>
        )}

      <Text>Descrição</Text>
      <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} multiline />

      <Text>Endereço (Descrição da Localização)</Text>
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
        region={{
        latitude: localizacao.lat,
        longitude: localizacao.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        }}
    >
        <Marker
        draggable
        coordinate={{
            latitude: localizacao.lat,
            longitude: localizacao.lng,
        }}
        onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setLocalizacao({ lat: latitude, lng: longitude });
        }}
        title="Local da Obra"
        description={nomeLocal}
        />
    </MapView>
    )}

    <Button
        mode="contained"
        icon="content-save"
        onPress={salvarObra}
        style={styles.btn}
      >
        Salvar Alterações
    </Button>
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
  borderColor: '#ccc',
  },
  card:{
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  btn:{
    marginBottom: 65,
    backgroundColor: '#008000',
    marginInlineStart: 'auto'
  },
  fotoButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#A34003',
    borderWidth: 1,
  },
});
