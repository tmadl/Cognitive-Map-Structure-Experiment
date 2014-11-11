function [ matlabcol ] = convertCol( c )
%CONVERTCOL Summary of this function goes here
%   Detailed explanation goes here
   
    matlabcol = [];
    for i=1:length(c)
        matlabcol = [matlabcol ; [floor(c(i)/(256*256))/256 mod(floor(c(i)/256), 256)/256 mod(c(i), 256)/256]];
    end;

end

