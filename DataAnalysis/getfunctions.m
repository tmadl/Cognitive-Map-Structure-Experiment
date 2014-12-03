function [ f ] = getfunctions( labels )
%GETFUNCTIONS get functions of buildings based on their labels. returns
%binary array with 1 if shop and 0 if house

    f=[];
    for i=1:length(labels)
        if findstr(labels{i}, 'shop')
            f = [f 1];
        else 
            f = [f 0];
        end;
    end;
    
end

