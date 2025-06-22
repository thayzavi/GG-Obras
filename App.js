import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from './src/Screens/HomeScreens';
import ObraScreen from './src/Screens/ObraScreens';
import Fiscalizacao from './src/Screens/FiscalizacaoScreens';
import DetalhesObra from './src/Screens/DetalhesObraScreens';
import EditarObra from './src/Screens/EditarObraScreens';
import DetalhesFiscalizacao from './src/Screens/DetalhesFiscalizacaoScreens';
import EditarFiscalizacao from './src/Screens/EditarFiscalizacaoScreens';

const Stack = createNativeStackNavigator();

export default function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{title:'Obras'}}></Stack.Screen>
      <Stack.Screen name="NovaObra" component={ObraScreen} options={{title:'Cadastrar Obra'}}></Stack.Screen>
      <Stack.Screen name="Fiscalizacao" component={Fiscalizacao} options={{title:'Nova Fiscalização'}}></Stack.Screen>
      <Stack.Screen name="DetalhesObra" component={DetalhesObra} options={{title:'Detalhes Obra'}}></Stack.Screen>
      <Stack.Screen name="EditarObra" component={EditarObra} options={{title: 'Editar Obra'}}></Stack.Screen>
      <Stack.Screen name="DetalhesFiscalizacao" component={DetalhesFiscalizacao} options={{title:'Detalhes Fiscalização'}}></Stack.Screen>
      <Stack.Screen name="EditarFiscalizacao" component={EditarFiscalizacao} options={{title: 'Editar Fiscalização'}}></Stack.Screen>
      
      </Stack.Navigator>
    </NavigationContainer>
  );
}