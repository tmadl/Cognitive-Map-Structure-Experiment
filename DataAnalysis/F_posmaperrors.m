files=dir('logs');
Sh = 2; Sw = 3;
F=0;
subjd = [];
subjreald = [];
subjdratio = [];
subjwithin = [];
subjcond = [];
%subjcorr = [];
subjexpno = [];
subjid = [];
for i=3:length(files)
    n = files(i).name
    try
        ldata = loadjson(['logs/' n]);
        F = F + 1;
    catch err
        error = 1;
        err
    end;
    
    %d=ldata.exp1;
    %A_distfromjson;
    %if length(r) > 1
    %    r = r(2,1);
    %end;
    %subjcorr = [subjcorr r];
    
    f = fieldnames(ldata);
    exp = f(2);
    exp = exp{1};
    expno = str2num(exp(length(exp)));
    d=ldata.(exp);
    
    names=fieldnames(d);
    N=length(names);
    for j=1:N
        t = d.(names{j});
        if isfield(t, 'rememberedX')
            real = t.real_coords;
            
            %remembered = [cellfun(@str2num,t.rememberedX)' cellfun(@str2num,t.rememberedY)'];
            remembered = [];
            for r=1:length(t.rememberedX)
                X = t.rememberedX; Y = t.rememberedY;
                if iscell(X); x = X{r}; else x = X(r); end;
                if iscell(Y); y = Y{r}; else y = Y(r); end;
                if ischar(x);x = str2num(x);end;
                if ischar(y);y = str2num(y);end;
                remembered(r, :) = [x y];
            end;
            
            [dd,remTrans,tr] = procrustes(real,remembered);
            remembered = remTrans;
            
            for k=1:size(real, 1)
                TODO
            end;
        end;
    end;
end;

% correct TSP numbering (dist 2, reg 1, col 3), to always have DISTGROUPCOND = 1, COLGROUPCOND=2, FUNCGROUPCOND=3, REGCOND = 4
subjcond(find(subjcond==1 & subjexpno == 4)) = 4; % regular condition
subjcond(find(subjcond==2 & subjexpno == 4)) = 1; % distance condition
subjcond(find(subjcond==3 & subjexpno == 4)) = 2; % color condition
