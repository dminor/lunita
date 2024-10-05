function anagramas(c1, c2)
    if string.len(c1) ~= string.len(c2) then
        return false
    end

    local tabla1 = {}
    for i=1, string.len(c1) do
        tabla1[i] = string.byte(c1, i)
    end
    table.sort(tabla1)

    local tabla2 = {}
    for i=1, string.len(c2) do
        tabla2[i] = string.byte(c2, i)
    end
    table.sort(tabla2)

    for i=1, string.len(c1) do
        if tabla1[i] ~= tabla2[i] then
            return false
        end
    end

    return true
end

print(anagramas("amor", "roma")); --true
print(anagramas("presa", "pesar")); --true
print(anagramas("tinieblas", "sibilante")); --true
print(anagramas("carol", "zero")); --false
print(anagramas("caro", "zero")); --false
