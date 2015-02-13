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
            
            %t.cluster_assignments
            allpairs = nchoosek(1:length(t.cluster_assignments), 2);
            ds = [];
            realds = [];
            dratio = [];
            within = [];
            for k=1:length(allpairs)
                iswithin = t.cluster_assignments(allpairs(k, 1)) == t.cluster_assignments(allpairs(k, 2));
                within = [within iswithin];
                x1 = remembered(allpairs(k, 1), 1);
                y1 = remembered(allpairs(k, 1), 2);
                x2 = remembered(allpairs(k, 2), 1);
                y2 = remembered(allpairs(k, 2), 2);
                cd = sqrt((x2-x1)^2 + (y2-y1)^2);
                ds = [ds cd];
                x1 = real(allpairs(k, 1), 1);
                y1 = real(allpairs(k, 1), 2);
                x2 = real(allpairs(k, 2), 1);
                y2 = real(allpairs(k, 2), 2);
                crd = sqrt((x2-x1)^2 + (y2-y1)^2);
                realds = [realds crd];
                dratio = [dratio 100/crd*cd];
                cond = t.condition;
                if isempty(cond)
                    cond = -1;
                end;
                subjcond = [subjcond cond];
            end;
            subjd = [subjd ds];
            subjreald = [subjreald realds];
            subjwithin = [subjwithin within];
            subjdratio = [subjdratio dratio];
            subjexpno = [subjexpno repmat(expno, 1, length(ds))];
            subjid = [subjid repmat(i, 1, length(ds))];
    %         [dd,remTrans,tr] = procrustes(real,remembered);
    %         scatter(real(:,1), real(:,2), 'b');
    %         hold on;
    %         scatter(remTrans(:,1), remTrans(:,2), 'r');
    %         hold off;
        end;
    end;
end;

% correct TSP numbering (dist 2, reg 1, col 3), to always have DISTGROUPCOND = 1, COLGROUPCOND=2, FUNCGROUPCOND=3, REGCOND = 4
subjcond(find(subjcond==1 & subjexpno == 4)) = 4; % regular condition
subjcond(find(subjcond==2 & subjexpno == 4)) = 1; % distance condition
subjcond(find(subjcond==3 & subjexpno == 4)) = 2; % color condition

% filter = find(subjcond ~= 1); % exclude distance condition
%  subjd = subjd(filter);
%  subjreald = subjreald(filter);
%  subjdratio = subjdratio(filter);
%  subjwithin = subjwithin(filter);
%  subjcond = subjcond(filter);
%  subjexpno = subjexpno(filter);

w=1;
scatter(subjreald(find(subjwithin==w)), abs(subjd(find(subjwithin==w)) - subjreald(find(subjwithin==w))))
%scatter(subjd(find(subjwithin==w))./subjdratio(find(subjwithin==w)).*100, subjd(find(subjwithin==w))) % real distance
hold on;
w=0;
scatter(subjreald(find(subjwithin==w)), abs(subjd(find(subjwithin==w)) - subjreald(find(subjwithin==w))), 'r')
%scatter(subjd(find(subjwithin==w))./subjdratio(find(subjwithin==w)).*100, subjd(find(subjwithin==w)), 'r') % real distance

err = subjd - subjreald;
%err = 100./subjreald.*subjd;
%err = subjd > subjreald;
[h,p]=ttest2(err(find(subjwithin==0)), err(find(subjwithin==1)))
within_errmean = mean(err(find(subjwithin==1)))
across_errmean = mean(err(find(subjwithin==0)))

legend('within cluster', 'across cluster')
xlabel('real distance')
ylabel('distance error')
h = lsline;
set(h(1),'color','b','LineWidth',2)
set(h(2),'color','r','LineWidth',2)