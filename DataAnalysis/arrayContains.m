function [ contains ] = arrayContains( arr1, arr2 )
%ARRAYCONTAINS Summary of this function goes here
%   Detailed explanation goes here
    
    contains = false;
    for i=0:(length(arr1)-length(arr2))
        correct = 0;
        for j=1:length(arr2)
            if strcmp(arr1{i+j}, arr2{j})
                correct = correct + 1;
            else
                break;
            end;
        end;
        if correct == length(arr2)
            contains = true;
            break;
        end;
    end;

end

