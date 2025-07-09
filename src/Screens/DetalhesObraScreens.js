import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet, Alert, Image ,TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native';
import { Button, Card } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { api } from '../Services/api';
import FiscalizacaoItem from '../Componentes/FiscalizacaoItem';

export default function ObraDetailScreen({ route, navigation }) {
  const { obraId } = route.params;
  const [obra, setObra] = useState(null);
  const [fiscalizacoes, setFiscalizacoes] = useState([]);
  const [emailDestino, setEmailDestino] = useState('');

  const fetchObra = async () => {
    try {
      const response = await api.get(`/api/obras/${obraId}`);
      setObra(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar obra');
    }
  };

  const fetchFiscalizacoes = async () => {
    try {
      const response = await api.get(`/api/obras/${obraId}/fiscalizacoes`);
      setFiscalizacoes(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar fiscalizações');
    }
  };

 useFocusEffect(
  React.useCallback(() => {
    fetchObra();
    fetchFiscalizacoes();
  }, [])
);
  const excluirObra = async () => {
    try {
      await api.delete(`/api/obras/${obraId}`);
      Alert.alert('Sucesso', 'Obra excluída');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir obra');
    }
  };

  const enviarEmail = async () => {
    if (!emailDestino) {
      Alert.alert('Erro', 'Informe um email para envio');
      return;
    }

    try {
      await api.post(`/api/obras/${obraId}/send-email`, {
         email: emailDestino
       });

      Alert.alert('Sucesso', 'Email enviado!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar email');
    }
  };

  if (!obra) return <Text>Carregando...</Text>;

  return (
  <KeyboardAvoidingView
    style={{ flex: 1}}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        
        <View>
          <Button
            icon="pencil"
            mode="contained"
            onPress={() => navigation.navigate('EditarObra', {obraId})} style={styles.Button}>
            Editar Obra
          </Button>
        </View>

      {obra.foto && (
        <Card style={styles.card}>
          <Card.Cover source={{ uri: obra.foto }} />
      </Card>
      )}
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>{obra.nome}</Text>
            <Text> 👷 Responsável: {obra.responsavel}</Text>
            <Text> 📅 Início: {new Date(obra.dataInicio).toLocaleDateString()}</Text>
            <Text> ⏳ Fim: { obra.dataFim ? new Date(obra.dataFim).toLocaleDateString() : 'Não definido'}</Text>
            <Text> 📝 Descrição: {obra.descricao || 'Sem descrição'}</Text>
            <Text> 📍 Endereço: {obra.endereco || 'Endereço não disponível'}</Text>

            {obra.localizacao && (
              <MapView
                  style={styles.map}
                  initialRegion={{
                      latitude: obra.localizacao.lat,
                      longitude: obra.localizacao.lng,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                  }}
                  >
                  <Marker
                      coordinate={{
                      latitude: obra.localizacao.lat,
                      longitude: obra.localizacao.lng,
                      }}
                      title="Local Fiscalização"
                  />
              </MapView>
              )} 
          </Card.Content>
        </Card>

      <View>
        <Button 
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('Fiscalizacao', { obraId})} style={styles.Button}>
          Nova Fiscalização
          </Button>
      </View>

      <Text style={styles.subTitle}>Fiscalizações</Text>
      <Card style={styles.card}>
        <Card.Content>  
          <View>
            {fiscalizacoes.length === 0 ? (
              <Text style={{ marginTop: 15 }}>Nenhuma fiscalização cadastrada.</Text>
            ) : (
              fiscalizacoes.map(item => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => navigation.navigate('DetalhesFiscalizacao', { fiscalizacao: item })}
                >
                  <FiscalizacaoItem fiscalizacao={item} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </Card.Content>
    </Card>

      <View style={{ marginVertical: 20 }}>
          <Text style={styles.title}>Enviar E-mail </Text>
          <Text>Enviar dados da obra por email</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o email"
            value={emailDestino}
            onChangeText={setEmailDestino}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button title="Enviar Email" 
          onPress={enviarEmail} 
          mode="contained"
          icon="send"
          style={styles.ButtonEmail}>
            Enviar
          </Button>
        </View>

        <View style={styles.buttonGroup}>
            
            <Button
            icon="delete"
            mode="contained"
            onPress={() => (
              Alert.alert(
                'Confirma exclusão',
              'Tem certeza que deseja excluir esta obra?',
            [
              {
                text: 'Cancelar',
                style: 'cancel'
              },
              {
                text: 'Excluir',
                onPress: excluirObra,
                style: 'destructive'
              }
            ])
            )}
            buttonColor="red"
            style={styles.btn}>
              Excluir Obra
            </Button>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 15,
    backgroundColor: '#F4F6F6',
   },
  title: { 
    fontSize: 22,
    fontWeight: 'bold',  
    marginBottom: 5 
  },
  subTitle: { 
  fontSize: 18,
  marginVertical: 10, 
  fontWeight:'600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 8,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 4,
  },
  map:{
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
  foto: { 
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8
   },
    card: {
    marginBottom: 18,
    borderRadius: 10,
    elevation: 2,
    backgroundColor:'#fff',
  },
  Button:{
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 14,
    width:'50%',
    marginLeft: '50%',
    backgroundColor: '#A34003',
  },
  btn:{
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 14,
    width:'35%'
  },
  ButtonEmail: {
    marginBottom: 20,
    backgroundColor: '#008000',
    marginInlineStart: 'auto',
  },
});
