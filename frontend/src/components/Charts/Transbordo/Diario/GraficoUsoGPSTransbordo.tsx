                <Text fontSize="10px" fontWeight="medium" noOfLines={1} title={`${item.id} - ${item.nome}`} mb={0.5} color="black">
                  {item.id} - {item.nome}
                </Text>
                
                {/* Segunda linha: Barra de progresso e valor percentual */}
                <Flex direction="row" align="center">
                  <Box flex="1" h="13px" position="relative" mr={2} maxW="calc(100% - 40px)">
                    <Flex 
                      position="absolute" 
                      bg={item.porcentagem >= 95 ? "green.500" : item.porcentagem >= 76 ? "yellow.500" : "red.500"} 
                      h="100%" 
                      w={`${scalePercentage(item.porcentagem)}%`}
                      borderRadius="sm"
                      alignItems="center"
                    />
                    
                    {/* Linha vertical indicando a meta */}
                    <Box 
                      position="absolute" 
                      top="0" 
                      left={`${metaScaled}%`} 
                      h="13px"
                      w="2px"
                      bg="rgba(0,0,0,0.7)"
                      zIndex="2"
                    />
                  </Box>
                  <Text fontSize="10px" fontWeight="bold" w="35px" textAlign="right" color={item.porcentagem >= 95 ? "green.500" : item.porcentagem >= 76 ? "yellow.500" : "red.500"}>
                    {item.porcentagem !== undefined ? item.porcentagem.toFixed(1) : "0"}%
                  </Text>
                </Flex> 

// Encontra o valor máximo para definir a escala
const maxPorcentagem = Math.max(...data.map(item => item.porcentagem));

// Para "maior melhor", usamos o maior valor como referência para a escala
const valorReferencia = Math.max(maxPorcentagem, meta * 1.2); // Garante que a meta fique visível

// Função de escala que garante que nunca ultrapasse 100%
const scalePercentage = (porcentagem: number) => Math.min((porcentagem / valorReferencia) * 100, 100);

// Calcula onde ficará a linha de meta na escala relativa
const metaScaled = (meta / valorReferencia) * 100;

// Ordena por porcentagem (do maior para o menor)
const sortedData = [...data].sort((a, b) => b.porcentagem - a.porcentagem);

// Define as cores com base no valor da porcentagem (maior melhor)
const getBarColor = (value: number) => {
  if (value >= meta) return "green.500"; // verde para bom (acima ou igual à meta de 90%)
  if (value >= meta * 0.8) return "yellow.500"; // amarelo para médio (até 20% abaixo da meta)
  return "red.500"; // vermelho para ruim (abaixo de 80% da meta)
}; 