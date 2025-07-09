import React, { useState, useEffect } from 'react';
import { View, Text, TextInput,StyleSheet, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card} from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import RNPickerSelect from 'react-native-picker-select';
import * as ImageManipulator from 'expo-image-manipulator';
import { api } from '../Services/api';

export default function EditarFiscalizacao({ navigation , route}) {
    const { fiscalizacao } = route.params;

    const [status, setStatus] = useState('');
    const [showDropDown, setShowDropDown] = useState(false);
    const [data, setData] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [foto, setFoto] = useState(null);
    const [localizacao, setLocalizacao] = useState(null);
    const [endereco, setendereco] = useState('');

    const statusList = [
    { label: 'Pendente', value: 'pendente' },
    { label: 'Em andamento', value: 'em-andamento' },
    { label: 'Concluído', value: 'concluido' },
    { label: 'Atrasado', value: 'atrasado' },
  ];
    

    useEffect(() => {
        setStatus(fiscalizacao.status || '');
        setData(formatDate(fiscalizacao.data));
        setObservacoes(fiscalizacao.observacoes || '');
        setFoto(fiscalizacao.foto || null);
        setLocalizacao(fiscalizacao.localizacao || null);
        setendereco(fiscalizacao.endereco || '');
    }, [fiscalizacao]);

    //formatação data 
    const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const parseDate = (value) => {
  if (!value || typeof value !== 'string' || !value.includes('/')) {
    return new Date();
  }

  const [dia, mes, ano] = value.split('/');
  return new Date(`${ano}-${mes}-${dia}`);
};

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

  const salvarAlteracoes = async () => {
    if (!status || !data || !localizacao){
        Alert.alert('Error', 'Preencha todos os campos');
        return;
    }

    try{
        await api.put(`/api/fiscalizacoes/${fiscalizacao._id}`, {
            status,
            data: parseDate(data),
            observacoes,
            localizacao,
            endereco,
            foto,
        });

        Alert.alert('Sucesso', 'Fiscalização atualizada.')
        navigation.goBack();
    }  catch (error) {
    console.error('Erro ao atualizar fiscalização:', error.response?.data || error.message);
    Alert.alert('Error','Falha ao atualizar fiscalização');
    }
  };
  
  return (

    <ScrollView contentContainerStyle={styles.container}>

     <Text>Status:</Text>
        <RNPickerSelect
        onValueChange={(value) => setStatus(value)}
        value={status}
        placeholder={{ label: 'Selecione o status', value: '' }}
        items={statusList}
        style={{
          inputIOS: styles.picker,
          inputAndroid: styles.picker,
        }}
    />


        <Text>Data:</Text>
        <TextInput style={styles.input} value={data} onChangeText={setData} placeholder="DD/MM/AAAA"></TextInput>

        <Text>Observações:</Text>
        <TextInput style={styles.input} value={observacoes} onChangeText={setObservacoes}></TextInput>

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
        

        <Text>Endereço:</Text>
        <TextInput style={styles.input} value={endereco} onChangeText={setendereco}/>

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
            title="Local da Fiscalização"
            description={endereco}
          />
        </MapView>
    )}

    <Button
            mode="contained"
            icon="content-save"
            onPress={salvarAlteracoes}
            style={styles.btn }
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
  map:{
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
    buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
   },
  card:{
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  fotoButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#A34003',
    borderWidth: 1,
  },
  picker: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'black',
    marginVertical: 8,
  },
  btn:{
    marginBottom: 65,
    backgroundColor: '#008000',
    marginInlineStart: 'auto'
  },

});