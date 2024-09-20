function anagramas(c1, c2)
    if c1:len() ~= c2:len() then
        return false
    end

    local tabla1 = {}
    for i=1, c1:len() do
        tabla1[i] = c1:byte(i)
    end
    table.sort(tabla1)

    local tabla2 = {}
    for i=1, c2:len() do
        tabla2[i] = c2:byte(i)
    end
    table.sort(tabla2)

    for i=1, c1:len() do
        if tabla1[i] ~= tabla2[i] then
            return false
        end
    end

    return true
end