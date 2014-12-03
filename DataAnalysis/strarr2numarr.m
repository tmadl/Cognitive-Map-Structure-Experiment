function [ ret ] = strarr2numarr( strarr )
%STRARR2NUMARR Summary of this function goes here
%   Detailed explanation goes here

    if size(strarr, 1) > size(strarr, 2)
        strarr = strarr';
    end;

    ret = zeros(1, size(strarr, 2));
    for i=1:size(strarr, 2)
        c = strarr(:, i);
        if iscell(c)
            c = cell2mat(c);
        end;
        if size(c, 1) > size(c, 2)
            c = c';
        end;
        if isstr(c)
            c = str2num(c);
        end;
        ret(i) = c;
    end;
end

