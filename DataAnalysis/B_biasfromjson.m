if (~exist('p'))
    p=[0.9131   45.9174];
end;

%d=loadjson(json);
%d=d.exp2;
%d = ldata;


names=fieldnames(d);
N=length(names);

estd=[];
reald=[];
worb=[];
bias=[];
conditions = [];

for i=1:N
    t = d.(names{i});
    M = length(t.real_distances);
    for j=1:M
        e = t.distance_estimations(j, 1);
        estd = [estd e];
        reald = [reald t.real_distances(j)];
        worb = [worb t.distance_estimations(j, 4)];
        cond = -1;
        if t.condition
            cond = t.condition;
        end;
        conditions= [conditions cond];
    end;
end;
estd_uncorr = estd;

r = corrcoef(estd, reald)
SSresid = sum((reald-estd).^2);
SStotal = ((length(reald)-1) * var(reald));
rsq = 1 - SSresid/SStotal

% p=polyfit(estd', reald', 1);
% yfit = estd.*p(1)+p(2);
% 
% r_corr = corrcoef(estd, reald)
% SSresid = sum((reald-yfit).^2);
% SStotal = ((length(reald)-1) * var(reald));
% rsq_corr = 1 - SSresid/SStotal

%!corrected dist.?? 
%estd = estd .* p(1) + p(2);
for i=1:length(estd)
    b = estd(i) > reald(i);
    bias = [bias b];
end;

biases_within = bias(find(worb==0));
underestimated_within = length(find(biases_within==0))/length(biases_within)
overestimated_within = length(find(biases_within==1))/length(biases_within)
biases_across = bias(find(worb==1));
underestimated_across = length(find(biases_across==0))/length(biases_across)
overestimated_across = length(find(biases_across==1))/length(biases_across)